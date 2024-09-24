# BreadcrumbNavigation Component Documentation

This document provides a comprehensive guide to the `BreadcrumbNavigation` component used in our project. The component facilitates breadcrumb-style navigation through different steps in a multi-step form or process, enhancing user experience by providing visual cues about their progress.

---

## Table of Contents

- [Introduction](#introduction)
- [Component Overview](#component-overview)
- [Props](#props)
  - [`steps`](#steps)
  - [`currentStep`](#currentstep)
  - [`onStepClick`](#onstepclick)
  - [`stepHasData`](#stephasdata)
  - [`isStepClickable`](#isstepclickable)
- [Component Structure](#component-structure)
- [Styling and Classes](#styling-and-classes)
- [Usage Example](#usage-example)
- [Behavior and Interactivity](#behavior-and-interactivity)
- [Dependencies](#dependencies)
- [Notes and Best Practices](#notes-and-best-practices)

---

## Introduction

The `BreadcrumbNavigation` component is a custom React component designed to display a breadcrumb navigation bar. It allows users to:

- See their current position in a multi-step process.
- Navigate between steps, provided certain conditions are met.
- Receive visual feedback on completed, current, and future steps.

This component is tailored for internal use within our project and is not intended for third-party distribution.

---

## Component Overview

```jsx
import React, { useRef, useEffect } from 'react';

const BreadcrumbNavigation = ({ steps, currentStep, onStepClick, stepHasData, isStepClickable }) => {
  // Component implementation
};

export default BreadcrumbNavigation;
```

The component uses React hooks such as `useRef` and `useEffect` to manage scrolling behavior and to keep the active step centered in the view when necessary.

---

## Props

The `BreadcrumbNavigation` component accepts the following props:

### `steps`

- **Type**: `Array`
- **Description**: An array of step objects that define the navigation steps.
- **Structure**:
  ```jsx
  [
    { step: Number, title: String },
    // ...additional steps
  ]
  ```
- **Example**:
  ```jsx
  const steps = [
    { step: 0, title: 'Personal Information' },
    { step: 1, title: 'Married Status' },
    // ...additional steps
  ];
  ```

### `currentStep`

- **Type**: `Number`
- **Description**: The index of the current active step in the `steps` array.
- **Usage**: Determines which step is highlighted as active in the breadcrumb.

### `onStepClick`

- **Type**: `Function`
- **Description**: A callback function invoked when a step is clicked.
- **Parameters**:
  - `index` (Number): The index of the clicked step.
- **Usage**:
  ```jsx
  const handleStepClick = (index) => {
    // Logic to handle step change
  };
  ```

### `stepHasData`

- **Type**: `Function`
- **Description**: A function that checks if a particular step has been completed or has data.
- **Parameters**:
  - `step` (Number): The step number to check.
- **Returns**: `Boolean` indicating whether the step has data.
- **Usage**:
  ```jsx
  const stepHasData = (step) => {
    // Return true if the step has data
  };
  ```

### `isStepClickable`

- **Type**: `Function`
- **Description**: Determines if a step is clickable based on certain conditions.
- **Parameters**:
  - `index` (Number): The index of the step to check.
- **Returns**: `Boolean` indicating whether the step is clickable.
- **Usage**:
  ```jsx
  const isStepClickable = (index) => {
    // Return true if the step should be clickable
  };
  ```

---

## Component Structure

The component consists of the following key parts:

1. **Refs**:
   - `scrollContainerRef`: References the navigation container for scrolling purposes.
   - `activeStepRef`: References the currently active step.

2. **Effect Hook** (`useEffect`):
   - Automatically scrolls the navigation container to keep the active step centered when `currentStep` changes.

3. **Render Logic**:
   - Iterates over the `steps` array to render each step as a list item.
   - Determines the styling and interactivity of each step based on its state (active, past, future).

4. **Event Handling**:
   - Handles click events on steps to trigger navigation via `onStepClick`.

---

## Styling and Classes

The component uses Tailwind CSS classes for styling. Below is a breakdown of the class logic based on the step's state:

- **Base Button Classes**:
  ```css
  'flex items-center px-2.5 py-1.5 rounded-full text-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
  ```

- **Conditional Classes**:
  - **Active Step**:
    ```css
    'bg-sky-800 text-white font-semibold shadow ring-2 ring-blue-300'
    ```
  - **Past Step (Completed)**:
    ```css
    'bg-green-100 text-green-800 hover:bg-green-200'
    ```
  - **Future Step**:
    ```css
    'bg-gray-200 text-gray-400'
    ```
  - **Disabled Step**:
    ```css
    'cursor-not-allowed text-gray-400'
    ```
  - **Hover Effect for Clickable Steps**:
    ```css
    'hover:bg-opacity-80'
    ```

---

## Usage Example

Below is an example of how to use the `BreadcrumbNavigation` component within a parent component:

```jsx
import React, { useState } from 'react';
import BreadcrumbNavigation from './BreadcrumbNavigation';

const ParentComponent = () => {
  const steps = [
    { step: 0, title: 'Personal Information' },
    { step: 1, title: 'Married Status' },
    { step: 2, title: 'Spouse Information' },
    // ...additional steps
  ];

  const [currentStep, setCurrentStep] = useState(0);

  const handleStepClick = (index) => {
    // Logic to navigate to the clicked step
    setCurrentStep(index);
  };

  const stepHasData = (step) => {
    // Logic to determine if a step has data
    return true; // or false based on your logic
  };

  const isStepClickable = (index) => {
    // Logic to determine if a step is clickable
    return index <= currentStep;
  };

  return (
    <BreadcrumbNavigation
      steps={steps}
      currentStep={currentStep}
      onStepClick={handleStepClick}
      stepHasData={stepHasData}
      isStepClickable={isStepClickable}
    />
  );
};

export default ParentComponent;
```

---

## Behavior and Interactivity

- **Active Step Centering**:
  - When the `currentStep` changes, the component automatically scrolls the navigation bar to center the active step.

- **Step States**:
  - **Active**: The current step the user is on.
  - **Past**: Steps that have been completed.
  - **Future**: Steps that are yet to be completed.

- **Click Handling**:
  - Steps are clickable based on the `isStepClickable` function.
  - Clicking on a step invokes the `onStepClick` callback if the step is clickable.
  - If a step is not clickable, an alert is displayed (currently in Spanish: "Por favor, completa el paso de Información Personal primero.").

---

## Dependencies

- **React Hooks**:
  - `useRef`: For referencing DOM elements.
  - `useEffect`: For side effects related to scrolling.

- **Tailwind CSS**:
  - Used extensively for styling the component.

---

## Notes and Best Practices

- **Localization**:
  - The alert message displayed when a non-clickable step is clicked is currently in Spanish. Adjust the message based on the language needs of the project.

- **Accessibility**:
  - The component uses proper focus and ring classes for better accessibility.
  - Ensure that the `button` elements are accessible and provide necessary ARIA attributes if needed.

- **Customization**:
  - Since the component uses Tailwind CSS, you can easily adjust the styling by modifying the class names.
  - The SVG icon used between steps can be replaced or styled differently as required.

- **Performance**:
  - The `useEffect` hook depends on `currentStep`, ensuring that scrolling only occurs when the active step changes.

- **Error Handling**:
  - Ensure that the `stepHasData` and `isStepClickable` functions are robust to prevent unexpected behavior.

---

By following this documentation, developers within our project should be able to understand, use, and modify the `BreadcrumbNavigation` component effectively. This component enhances the user interface by providing clear navigation through the steps of our multi-step form or process.