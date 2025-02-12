import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  public breadcrumbsSubject = new BehaviorSubject<MenuItem[]>([]);

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        console.log('NavigationEnd');

        const breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
        this.breadcrumbsSubject.next(breadcrumbs);
        console.log('Breadcrumbs', breadcrumbs);
      });
  }

  updateLastBreadcrumbLabel(label: string) {
    console.log('Update Breadcrumbs 1');

    const current = this.breadcrumbsSubject.value;
    if (current.length > 0) {
      current[current.length - 1].label = label;
    }
    this.breadcrumbsSubject.next(current);
    console.log('Update Breadcrumbs 2');
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: MenuItem[] = []
  ): MenuItem[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url
        .map((segment) => segment.path)
        .join('/');

      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['title'];
      const icon = child.snapshot.data['icon'];

      if (label) {
        if (!breadcrumbs.some((b) => b.label === label)) {
          breadcrumbs.push({
            label,
            routerLink: url,
            icon,
          });
        }
      }

      this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  public setHome(home: MenuItem) {
    const current = this.breadcrumbsSubject.value;
    if (current.length > 0 && current[0].icon === 'pi pi-home') {
      current[0] = home;
    } else {
      current.unshift(home);
    }
    this.breadcrumbsSubject.next(current);
  }
}
