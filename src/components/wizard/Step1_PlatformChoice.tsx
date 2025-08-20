import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { motion } from 'framer-motion';

interface PlatformChoiceProps {
  onSelect: (platform: 'intel' | 'amd') => void;
}

const PlatformCard: React.FC<{
  platform: 'intel' | 'amd';
  title: string;
  description: string;
  onClick: () => void;
}> = ({ platform, title, description, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="h-full transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          {/* Placeholder for logos */}
          <div className="text-6xl font-bold text-muted-foreground/20">
            {platform.toUpperCase()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const Step1_PlatformChoice: React.FC<PlatformChoiceProps> = ({ onSelect }) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-3xl">选择您的平台</CardTitle>
          <CardDescription>请选择您的 CPU 平台，我们将为您推荐合适的配置。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlatformCard
              platform="intel"
              title="Intel"
              description="适用于酷睿、至强等绝大多数 Intel 处理器。"
              onClick={() => onSelect('intel')}
            />
            <PlatformCard
              platform="amd"
              title="AMD"
              description="适用于锐龙、线程撕裂者等 AMD 处理器。"
              onClick={() => onSelect('amd')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
