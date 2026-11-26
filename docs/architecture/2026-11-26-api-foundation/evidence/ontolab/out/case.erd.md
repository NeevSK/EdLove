```mermaid
erDiagram
Authority {
    uriorcurie id  
    Power power  
    datetime recorded_at  
    datetime valid_from  
    datetime valid_to  
}
Bond {
    uriorcurie id  
    Capacity capacity  
    datetime recorded_at  
    BondState state  
    datetime valid_from  
    datetime valid_to  
}
Enrollment {
    integer academic_year  
    Capacity capacity  
    integer grade  
    uriorcurie id  
    datetime recorded_at  
    BondState state  
    datetime valid_from  
    datetime valid_to  
}
Institution {
    uriorcurie id  
    string name  
}
Person {
    uriorcurie id  
    string display_name  
}

Authority ||--|| Bond : "granted_by"
Bond ||--|| Institution : "institution"
Bond ||--|| Person : "person"
Enrollment ||--|| Institution : "institution"
Enrollment ||--|| Person : "person"

```

