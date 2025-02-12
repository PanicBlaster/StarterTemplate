# Panic Blaster - Frontend Template

# DPL API

<p align="center">
  <img src="./public/Logo.png" width="400" alt="Panic Blaster Logo" />
</p>

## Backend API

Backend API

## Development server

To start a local development server, run:

```bash
ng serve
```

The application will run on port 4201 by default. Once the server is running, open your browser and navigate to `http://localhost:4201/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running in VS Code or Cursor

Tasks (tasks.json - in .vscode folder)

```json
{
  // For more information, visit: https://go.microsoft.com/fwlink/?LinkId=733558
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "start",
      "isBackground": true,
      "problemMatcher": {
        "owner": "typescript",
        "pattern": "$tsc",
        "background": {
          "activeOnStart": true,
          "beginsPattern": {
            "regexp": "(.*?)"
          },
          "endsPattern": {
            "regexp": "bundle generation complete"
          }
        }
      }
    },
    {
      "type": "npm",
      "script": "test",
      "isBackground": true,
      "problemMatcher": {
        "owner": "typescript",
        "pattern": "$tsc",
        "background": {
          "activeOnStart": true,
          "beginsPattern": {
            "regexp": "(.*?)"
          },
          "endsPattern": {
            "regexp": "bundle generation complete"
          }
        }
      }
    }
  ]
}
```

Launch Config (launch.json)

```json
{
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ng serve",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "npm: start",
      "url": "http://localhost:4201/"
    },
    {
      "name": "ng test",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "npm: test",
      "url": "http://localhost:9876/debug.html"
    }
  ]
}
```

Extensions

```json
{
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=827846
  "recommendations": ["angular.ng-template"]
}
```

# Page paradigm

Most pages are based on the following paradigm:

- List (list.component.ts)
- Detail/Edit (detail.component.ts)

## List Pages

The list page is a table that displays a list of items. It uses the `TableModule` from PrimeNG. This table should do pagination using skip and take.

## Detail/Edit Pages

The detail page is a form that displays a single item. It uses the `FormModule` from PrimeNG. This form should be used for details, create and edit.

Details route would be something like `/tenants/123` and the edit route would be `/tenants/123/edit`. The new route would be `/tenants/new`.

The detail page should have a back button that goes to the list page.

All pages should have a toolbar.

This toolbar should have a back button to go to the list page. The back button should be on the left side of the toolbar.

The toolbar will usually have an edit button that will engage edit mode. When going into edit mode the form should be populated with the item data and the edit button should change to a save button. When in edit mode the save button should be on the right side of the toolbar.

When in edit mode the route should include a /edit at the end.
Example: `/tenants/123/edit`

When creating a new item the route should include a /new at the end.
Example: `/tenants/new`

When the form sees a /new it should not query the backend for data.

For most detail pages their should also be a delete button to the left of the save button. You can delete the item by clicking the delete button. The delete button should be disabled if the item is new. The delete button should be enabled if the item is not new. The delete button should display a confirmation dialog before deleting the item.

Do not use the DropDown Component from PrimeNG use the select component from PrimeNG.

Form fields should be full width.

## Toolbar responsiveness

The toolbar should be responsive. It should have a back button on the left side and a save button on the right side. If we are on a mobile device do not display the text, just icons.

## Application Structure

The application consists of three main components:

- `app.component.ts/html`: The root component of the application
- `auth.component.ts/html`: Handles authentication functionality
- `home.component.ts/html`: The main landing page component

## Common imported components

The application uses the following common imports:

```
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    ToastModule,
    TooltipModule,
    ToolbarModule,
  ],
```

# AI Generation

List pages should be generated like the user list page. List pages should use the item-list component.

Detail pages should be generated like the user detail page. Detail pages should use the item-detail component.

<p align="center">
  Powered by <a href="#">Panic Blaster</a> 🚀
</p>
