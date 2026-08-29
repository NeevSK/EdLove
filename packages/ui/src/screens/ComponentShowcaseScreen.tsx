import React, { useState } from 'react';
import {
  Button,
  ButtonText,
  Combobox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FormField,
  Heading,
  Input,
  InputField,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
  ScrollView,
  Sheet,
  SheetContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  VStack,
} from '@repo/ui/primitives';

const roleOptions = [
  { label: 'Student', value: 'student' },
  { label: 'Teacher', value: 'teacher' },
  { label: 'Guardian', value: 'guardian' },
];

/** A low-chrome reference surface for reviewing the source-owned UI contract. */
export default function ComponentShowcaseScreen() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tab, setTab] = useState('form');
  const [role, setRole] = useState('student');

  return (
    <ScrollView className="flex-1 bg-phase-background">
      <VStack className="mx-auto w-full max-w-2xl gap-8 p-6">
        <VStack className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-[3px] text-phase-accent">
            UI reference surface
          </Text>
          <Heading size="3xl">Quietly consistent.</Heading>
          <Text className="max-w-xl text-base text-phase-text-secondary">
            The components below are composed from the same NativeWind-aware primitives and semantic
            tokens.
          </Text>
        </VStack>

        <Tabs value={tab} onValueChange={setTab} className="gap-4">
          <TabsList className="border-b border-phase-interactive/15">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="overlays">Overlays</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="gap-5">
            <FormField
              label="Display name"
              helperText="This is shown to people in your shared spaces."
            >
              <Input>
                <InputField placeholder="Your name" accessibilityLabel="Display name" />
              </Input>
            </FormField>
            <FormField label="Role" helperText="This controls the default workspace view.">
              <Combobox value={role} onValueChange={setRole} options={roleOptions} />
            </FormField>
            <FormField
              label="Validation example"
              errorText="A value is required before continuing."
            >
              <Input isInvalid>
                <InputField placeholder="Required value" accessibilityLabel="Validation example" />
              </Input>
            </FormField>
          </TabsContent>

          <TabsContent value="overlays" className="gap-3">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger className="rounded-lg border border-phase-interactive/20 px-4 py-3">
                <Text className="text-phase-text-primary">Toggle popover</Text>
              </PopoverTrigger>
              <PopoverContent align="start">
                <Text className="mb-2 text-sm text-phase-text-secondary">Anchored content</Text>
                <PopoverClose className="rounded-md bg-phase-accent px-3 py-2">
                  <Text className="text-sm font-semibold text-phase-text-on-accent">Close</Text>
                </PopoverClose>
              </PopoverContent>
            </Popover>
            <Button onPress={() => setDialogOpen(true)}>
              <ButtonText>Open dialog</ButtonText>
            </Button>
            <Button variant="outline" onPress={() => setSheetOpen(true)}>
              <ButtonText>Open sheet</ButtonText>
            </Button>
          </TabsContent>

          <TabsContent value="search" className="gap-3">
            <Text className="text-sm text-phase-text-secondary">
              Combobox search is implemented as a composed Command + Select interaction.
            </Text>
            <Combobox
              value={role}
              onValueChange={setRole}
              options={roleOptions}
              searchPlaceholder="Find a role"
            />
          </TabsContent>
        </Tabs>
      </VStack>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} accessibilityLabel="Example dialog">
        <DialogContent>
          <DialogHeader>
            <Heading size="lg">Confirm your role</Heading>
          </DialogHeader>
          <DialogBody>
            <Text className="text-phase-text-secondary">Your selected role is {role}.</Text>
          </DialogBody>
          <DialogFooter>
            <Button onPress={() => setDialogOpen(false)}>
              <ButtonText>Done</ButtonText>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <Heading size="lg" className="mb-4">
            Quick actions
          </Heading>
          <Button onPress={() => setSheetOpen(false)}>
            <ButtonText>Close sheet</ButtonText>
          </Button>
        </SheetContent>
      </Sheet>
    </ScrollView>
  );
}
