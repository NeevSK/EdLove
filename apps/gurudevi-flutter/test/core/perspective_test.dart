import 'package:flutter_test/flutter_test.dart';
import 'package:gurudevi_flutter/core/models/perspective.dart';

void main() {
  group('Perspective & Bond ReBAC Models', () {
    test('Bond correctly maps to institutional SanctuaryPerspective', () {
      const bond = Bond(
        id: 'bond-stmarys-1',
        entityType: 'SCHOOL',
        entityId: 'school-101',
        entityName: "St. Mary's Academy",
        capacity: 'Teacher',
      );

      final perspective = bond.toPerspective();
      expect(perspective.id, 'bond-stmarys-1');
      expect(perspective.kind, PerspectiveKind.institutional);
      expect(perspective.schoolId, 'school-101');
      expect(perspective.schoolName, "St. Mary's Academy");
      expect(perspective.capacity, 'Teacher');
      expect(perspective.label, "St. Mary's Academy (Teacher)");
    });

    test('Personal Sanctuary perspective constant is well-formed', () {
      const p = SanctuaryPerspective.personal;
      expect(p.id, 'personal');
      expect(p.kind, PerspectiveKind.personal);
      expect(p.label, 'Personal Sanctuary');
    });
  });
}
