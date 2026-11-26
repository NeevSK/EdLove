from __future__ import annotations

import re
import sys
from datetime import (
    date,
    datetime,
    time
)
from decimal import Decimal
from enum import Enum
from typing import (
    Any,
    ClassVar,
    Literal,
    Optional,
    Union
)

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    RootModel,
    SerializationInfo,
    SerializerFunctionWrapHandler,
    field_validator,
    model_serializer
)


metamodel_version = "1.12.0"
version = "None"


class ConfiguredBaseModel(BaseModel):
    model_config = ConfigDict(
        serialize_by_alias = True,
        validate_by_name = True,
        validate_assignment = True,
        validate_default = True,
        extra = "forbid",
        arbitrary_types_allowed = True,
        use_enum_values = True,
        strict = False,
    )





class LinkMLMeta(RootModel):
    root: dict[str, Any] = {}
    model_config = ConfigDict(frozen=True)

    def __getattr__(self, key:str):
        return getattr(self.root, key)

    def __getitem__(self, key:str):
        return self.root[key]

    def __setitem__(self, key:str, value):
        self.root[key] = value

    def __contains__(self, key:str) -> bool:
        return key in self.root


linkml_meta = LinkMLMeta({'default_prefix': 'gd',
     'default_range': 'string',
     'id': 'https://gurudevi.lk/ontology',
     'imports': ['linkml:types'],
     'name': 'gurudevi_case',
     'prefixes': {'gd': {'prefix_prefix': 'gd',
                         'prefix_reference': 'https://gurudevi.lk/ontology/'},
                  'gufo': {'prefix_prefix': 'gufo',
                           'prefix_reference': 'http://purl.org/nemo/gufo#'},
                  'linkml': {'prefix_prefix': 'linkml',
                             'prefix_reference': 'https://w3id.org/linkml/'},
                  'prov': {'prefix_prefix': 'prov',
                           'prefix_reference': 'http://www.w3.org/ns/prov#'},
                  'schema': {'prefix_prefix': 'schema',
                             'prefix_reference': 'http://schema.org/'}},
     'source_file': 'case.yaml',
     'title': 'Shared case - Person, Bond, Authority, Institution, Enrollment'} )

class Capacity(str, Enum):
    student = "student"
    teacher = "teacher"
    principal = "principal"
    guardian = "guardian"
    founder = "founder"


class BondState(str, Enum):
    invited = "invited"
    active = "active"
    suspended = "suspended"
    ended = "ended"


class Power(str, Enum):
    mark = "mark"
    enrol = "enrol"
    invite = "invite"
    view_reports = "view_reports"



class Person(ConfiguredBaseModel):
    """
    One human, one account for a whole life.
    """
    linkml_meta: ClassVar[LinkMLMeta] = LinkMLMeta({'annotations': {'ufo': {'tag': 'ufo', 'value': 'kind'}},
         'exact_mappings': ['schema:Person'],
         'from_schema': 'https://gurudevi.lk/ontology'})

    id: str = Field(default=..., json_schema_extra = { "linkml_meta": {'domain_of': ['Person', 'Institution', 'Bond', 'Authority']} })
    display_name: str = Field(default=..., json_schema_extra = { "linkml_meta": {'domain_of': ['Person']} })


class Institution(ConfiguredBaseModel):
    """
    A school, tuition institute or other organisation people bond with.
    """
    linkml_meta: ClassVar[LinkMLMeta] = LinkMLMeta({'annotations': {'ufo': {'tag': 'ufo', 'value': 'kind'}},
         'exact_mappings': ['schema:Organization'],
         'from_schema': 'https://gurudevi.lk/ontology'})

    id: str = Field(default=..., json_schema_extra = { "linkml_meta": {'domain_of': ['Person', 'Institution', 'Bond', 'Authority']} })
    name: str = Field(default=..., json_schema_extra = { "linkml_meta": {'domain_of': ['Institution']} })


class Bond(ConfiguredBaseModel):
    """
    How a person joins an institution in one capacity. A relator; it exists only while both sides do.
    """
    linkml_meta: ClassVar[LinkMLMeta] = LinkMLMeta({'annotations': {'lifecycle': {'tag': 'lifecycle',
                                       'value': 'state: state\n'
                                                'within: institution\n'
                                                'start: invited\n'
                                                'transitions:\n'
                                                '  - {from: invited, to: active, by: '
                                                'accept, who: [person]}\n'
                                                '  - {from: invited, to: ended, by: '
                                                'decline, who: [person]}\n'
                                                '  - {from: active, to: suspended, by: '
                                                'suspend, who: [principal]}\n'
                                                '  - {from: suspended, to: active, by: '
                                                'restore, who: [principal]}\n'
                                                '  - {from: active, to: ended, by: '
                                                'end, who: [person, principal]}\n'
                                                '  - {from: suspended, to: ended, by: '
                                                'end, who: [principal]}\n'},
                         'ufo': {'tag': 'ufo', 'value': 'relator'}},
         'from_schema': 'https://gurudevi.lk/ontology',
         'slot_usage': {'valid_to': {'name': 'valid_to', 'required': False}}})

    id: str = Field(default=..., json_schema_extra = { "linkml_meta": {'domain_of': ['Person', 'Institution', 'Bond', 'Authority']} })
    person: str = Field(default=..., json_schema_extra = { "linkml_meta": {'annotations': {'ufo': {'tag': 'ufo', 'value': 'mediation'}},
         'domain_of': ['Bond']} })
    institution: str = Field(default=..., json_schema_extra = { "linkml_meta": {'annotations': {'ufo': {'tag': 'ufo', 'value': 'mediation'}},
         'domain_of': ['Bond']} })
    capacity: Capacity = Field(default=..., json_schema_extra = { "linkml_meta": {'domain_of': ['Bond']} })
    state: BondState = Field(default=..., json_schema_extra = { "linkml_meta": {'domain_of': ['Bond']} })
    valid_from: datetime  = Field(default=..., description="""When it became true in the world (valid time).""", json_schema_extra = { "linkml_meta": {'domain_of': ['Bond', 'Authority']} })
    valid_to: Optional[datetime ] = Field(default=None, description="""When it stopped being true in the world. Empty means still true.""", json_schema_extra = { "linkml_meta": {'domain_of': ['Bond', 'Authority']} })
    recorded_at: datetime  = Field(default=..., description="""When Gurudevi learned it (transaction time).""", json_schema_extra = { "linkml_meta": {'domain_of': ['Bond', 'Authority'], 'slot_uri': 'prov:generatedAtTime'} })


class Enrollment(Bond):
    """
    A bond in the student capacity, with a grade and year.
    """
    linkml_meta: ClassVar[LinkMLMeta] = LinkMLMeta({'annotations': {'ufo': {'tag': 'ufo', 'value': 'relator (subkind of Bond)'}},
         'from_schema': 'https://gurudevi.lk/ontology',
         'slot_usage': {'capacity': {'equals_string': 'student', 'name': 'capacity'}}})

    grade: Optional[int] = Field(default=None, ge=1, le=13, json_schema_extra = { "linkml_meta": {'domain_of': ['Enrollment']} })
    academic_year: Optional[int] = Field(default=None, json_schema_extra = { "linkml_meta": {'domain_of': ['Enrollment']} })
    id: str = Field(default=..., json_schema_extra = { "linkml_meta": {'domain_of': ['Person', 'Institution', 'Bond', 'Authority']} })
    person: str = Field(default=..., json_schema_extra = { "linkml_meta": {'annotations': {'ufo': {'tag': 'ufo', 'value': 'mediation'}},
         'domain_of': ['Bond']} })
    institution: str = Field(default=..., json_schema_extra = { "linkml_meta": {'annotations': {'ufo': {'tag': 'ufo', 'value': 'mediation'}},
         'domain_of': ['Bond']} })
    capacity: Literal["student"] = Field(default=..., json_schema_extra = { "linkml_meta": {'domain_of': ['Bond'], 'equals_string': 'student'} })
    state: BondState = Field(default=..., json_schema_extra = { "linkml_meta": {'domain_of': ['Bond']} })
    valid_from: datetime  = Field(default=..., description="""When it became true in the world (valid time).""", json_schema_extra = { "linkml_meta": {'domain_of': ['Bond', 'Authority']} })
    valid_to: Optional[datetime ] = Field(default=None, description="""When it stopped being true in the world. Empty means still true.""", json_schema_extra = { "linkml_meta": {'domain_of': ['Bond', 'Authority']} })
    recorded_at: datetime  = Field(default=..., description="""When Gurudevi learned it (transaction time).""", json_schema_extra = { "linkml_meta": {'domain_of': ['Bond', 'Authority'], 'slot_uri': 'prov:generatedAtTime'} })


class Authority(ConfiguredBaseModel):
    """
    A power a bond grants (mark, enrol, invite...). Never outlives the bond that grants it.
    """
    linkml_meta: ClassVar[LinkMLMeta] = LinkMLMeta({'annotations': {'ufo': {'tag': 'ufo',
                                 'value': 'normative relator (UFO-C power)'}},
         'from_schema': 'https://gurudevi.lk/ontology'})

    id: str = Field(default=..., json_schema_extra = { "linkml_meta": {'domain_of': ['Person', 'Institution', 'Bond', 'Authority']} })
    granted_by: str = Field(default=..., json_schema_extra = { "linkml_meta": {'domain_of': ['Authority']} })
    power: Power = Field(default=..., json_schema_extra = { "linkml_meta": {'domain_of': ['Authority']} })
    valid_from: datetime  = Field(default=..., description="""When it became true in the world (valid time).""", json_schema_extra = { "linkml_meta": {'domain_of': ['Bond', 'Authority']} })
    valid_to: Optional[datetime ] = Field(default=None, description="""When it stopped being true in the world. Empty means still true.""", json_schema_extra = { "linkml_meta": {'domain_of': ['Bond', 'Authority']} })
    recorded_at: datetime  = Field(default=..., description="""When Gurudevi learned it (transaction time).""", json_schema_extra = { "linkml_meta": {'domain_of': ['Bond', 'Authority'], 'slot_uri': 'prov:generatedAtTime'} })


# Model rebuild
# see https://pydantic-docs.helpmanual.io/usage/models/#rebuilding-a-model
Person.model_rebuild()
Institution.model_rebuild()
Bond.model_rebuild()
Enrollment.model_rebuild()
Authority.model_rebuild()
