import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/perspective.dart';

const _kActiveBondIdKey = 'gurudevi_active_bond_id';

class PerspectiveNotifier extends ChangeNotifier {
  SanctuaryPerspective _activePerspective = SanctuaryPerspective.personal;
  List<SanctuaryPerspective> _availablePerspectives = [SanctuaryPerspective.personal];
  List<Bond> _availableBonds = [];
  bool _isHydrated = false;

  SanctuaryPerspective get activePerspective => _activePerspective;
  List<SanctuaryPerspective> get availablePerspectives => _availablePerspectives;
  List<Bond> get availableBonds => _availableBonds;
  bool get isHydrated => _isHydrated;

  PerspectiveNotifier() {
    restoreActivePerspective();
  }

  Future<void> setAvailableBonds(List<Bond> bonds) async {
    _availableBonds = bonds;
    _availablePerspectives = [
      SanctuaryPerspective.personal,
      ...bonds.map((b) => b.toPerspective()),
    ];

    final prefs = await SharedPreferences.getInstance();
    final savedBondId = prefs.getString(_kActiveBondIdKey);

    if (savedBondId != null) {
      final match = _availablePerspectives.firstWhere(
        (p) => p.id == savedBondId,
        orElse: () => _availablePerspectives.first,
      );
      _activePerspective = match;
    } else if (bonds.isNotEmpty) {
      _activePerspective = bonds.first.toPerspective();
    } else {
      _activePerspective = SanctuaryPerspective.personal;
    }

    _isHydrated = true;
    notifyListeners();
  }

  Future<void> restoreActivePerspective() async {
    final prefs = await SharedPreferences.getInstance();
    final savedBondId = prefs.getString(_kActiveBondIdKey);
    if (savedBondId != null && _availablePerspectives.any((p) => p.id == savedBondId)) {
      _activePerspective = _availablePerspectives.firstWhere((p) => p.id == savedBondId);
    }
    _isHydrated = true;
    notifyListeners();
  }

  Future<void> switchPerspective(String perspectiveId) async {
    final target = _availablePerspectives.firstWhere(
      (p) => p.id == perspectiveId,
      orElse: () => _activePerspective,
    );
    if (target != _activePerspective) {
      _activePerspective = target;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_kActiveBondIdKey, target.id);
      notifyListeners();
    }
  }
}

final perspectiveProvider = ChangeNotifierProvider<PerspectiveNotifier>((ref) {
  return PerspectiveNotifier();
});
