import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/routing/app_router.dart';
import 'core/theme/guru_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: GurudeviFlutterApp(),
    ),
  );
}

class GurudeviFlutterApp extends ConsumerWidget {
  const GurudeviFlutterApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'Gurudevi Mobile',
      debugShowCheckedModeBanner: false,
      theme: GuruTheme.theme,
      routerConfig: router,
    );
  }
}
