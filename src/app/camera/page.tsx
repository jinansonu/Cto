'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CameraPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 max-w-2xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>Camera Module</CardTitle>
          <CardDescription>Visual AI processing</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/70">Camera interface coming soon...</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
