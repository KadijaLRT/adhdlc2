import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import BrainDumpSheet from './BrainDumpSheet';

export default function AvivaFloatingButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => setOpen(true)}
        className="absolute bottom-8 right-6 bg-indigo-600 rounded-full w-16 h-16 items-center justify-center shadow-lg active:bg-indigo-500">
        <Text className="text-2xl">✨</Text>
      </Pressable>
      <BrainDumpSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}
