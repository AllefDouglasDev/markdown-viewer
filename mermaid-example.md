# Mermaid Diagram Examples

## Flowchart

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    User->>Browser: Click button
    Browser->>Server: HTTP Request
    Server->>Browser: Response
    Browser->>User: Display result
```

## Class Diagram

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +String color
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Error: Fail
    Success --> [*]
    Error --> Idle: Retry
```

## Gantt Chart

```mermaid
gantt
    title Project Schedule
    dateFormat  YYYY-MM-DD
    section Planning
    Research           :a1, 2024-01-01, 30d
    Design             :a2, after a1, 20d
    section Development
    Backend            :a3, after a2, 40d
    Frontend           :a4, after a2, 45d
    section Testing
    QA Testing         :after a3, 15d
```

## Pie Chart

```mermaid
pie title Technologies Used
    "JavaScript" : 42.5
    "TypeScript" : 30.0
    "Python" : 15.0
    "Go" : 12.5
```

## Git Graph

```mermaid
gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
    commit
```

## Entity Relationship Diagram

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
        string phone
    }
    ORDER {
        int orderNumber
        date orderDate
        string status
    }
    LINE-ITEM {
        int quantity
        decimal price
    }
```

## Normal Code Block (for comparison)

```javascript
function hello() {
  console.log('This is regular code, not a diagram');
}
```
