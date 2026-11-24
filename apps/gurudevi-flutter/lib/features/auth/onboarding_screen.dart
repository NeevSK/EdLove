import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/auth/auth_session_notifier.dart';
import '../../core/theme/tokens.g.dart';
import '../../core/ui/guru_button.dart';
import '../../core/ui/guru_card.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _nameController = TextEditingController(text: 'Anura Bandara');
  String _selectedCapacity = 'Teacher';

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GuruColors.vellum,
      appBar: AppBar(title: const Text('Complete Your Profile')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(GuruSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Tell us how you participate in the Gurudevi sanctuary.',
                style: TextStyle(fontSize: 15, color: GuruColors.inkSubtle),
              ),
              const SizedBox(height: GuruSpacing.lg),

              GuruCard(
                backgroundColor: GuruColors.silk,
                elevated: true,
                child: Column(
                  children: [
                    TextField(
                      controller: _nameController,
                      style: const TextStyle(color: GuruColors.ink),
                      decoration: const InputDecoration(
                        labelText: 'Your Display Name',
                        labelStyle: TextStyle(color: GuruColors.inkSubtle),
                        border: OutlineInputBorder(),
                        focusedBorder: OutlineInputBorder(
                          borderSide: BorderSide(color: GuruColors.saffron, width: 2),
                        ),
                      ),
                    ),
                    const SizedBox(height: GuruSpacing.md),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedCapacity,
                      dropdownColor: GuruColors.silk,
                      style: const TextStyle(color: GuruColors.ink, fontSize: 15),
                      decoration: const InputDecoration(
                        labelText: 'Your Primary Capacity',
                        labelStyle: TextStyle(color: GuruColors.inkSubtle),
                        border: OutlineInputBorder(),
                        focusedBorder: OutlineInputBorder(
                          borderSide: BorderSide(color: GuruColors.saffron, width: 2),
                        ),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'Teacher', child: Text('Teacher')),
                        DropdownMenuItem(value: 'Principal', child: Text('Principal')),
                        DropdownMenuItem(value: 'Student', child: Text('Student')),
                        DropdownMenuItem(value: 'Guardian', child: Text('Guardian / Parent')),
                      ],
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedCapacity = val);
                      },
                    ),
                  ],
                ),
              ),
              const Spacer(),
              GuruButton(
                label: 'Enter Workspace',
                variant: GuruButtonVariant.primary,
                icon: Icons.arrow_forward,
                onPressed: () async {
                  await ref.read(authSessionProvider).completeOnboarding(
                        displayName: _nameController.text.trim(),
                        capacity: _selectedCapacity,
                      );
                  if (context.mounted) {
                    context.go('/workspace');
                  }
                },
              ),
              const SizedBox(height: GuruSpacing.md),
            ],
          ),
        ),
      ),
    );
  }
}
