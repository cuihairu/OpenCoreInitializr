import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/Progress';
import { cn } from '../lib/utils';
import { CheckCircle2, Clock, AlertCircle, Download, Settings, Package, FileText } from 'lucide-react';

export interface TaskStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress?: number;
  error?: string;
  icon?: React.ReactNode;
}

interface TaskProgressModalProps {
  isOpen: boolean;
  tasks: TaskStep[];
  overallProgress: number;
  currentTask?: string;
  onClose?: () => void;
  title?: string;
}

const TaskProgressModal: React.FC<TaskProgressModalProps> = ({
  isOpen,
  tasks,
  overallProgress,
  currentTask,
  onClose,
  title = 'OpenCore EFI 生成进度'
}) => {
  if (!isOpen) return null;

  const getStatusIcon = (task: TaskStep) => {
    if (task.icon) return task.icon;
    
    switch (task.status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'in_progress':
        return (
          <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        );
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TaskStep['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'in_progress':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-2xl max-h-[80vh] mx-4 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>总体进度</span>
              <span>{completedTasks}/{totalTasks} 已完成</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-96">
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg border transition-colors",
                  task.status === 'in_progress' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200',
                  task.status === 'completed' ? 'bg-green-50 border-green-200' : '',
                  task.status === 'error' ? 'bg-red-50 border-red-200' : ''
                )}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(task)}
                </div>
                
                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={cn("font-medium", getStatusColor(task.status))}>
                      {task.name}
                    </h4>
                    {task.status === 'in_progress' && task.progress !== undefined && (
                      <span className="text-sm text-blue-600 font-medium">
                        {Math.round(task.progress)}%
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {task.description}
                  </p>
                  
                  {/* Progress Bar for Current Task */}
                  {task.status === 'in_progress' && task.progress !== undefined && (
                    <div className="mt-2">
                      <Progress value={task.progress} className="h-1" />
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {task.status === 'error' && task.error && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                      {task.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// 预定义的任务步骤
export const createDefaultTasks = (): TaskStep[] => [
  {
    id: 'download-config',
    name: '下载配置模板',
    description: '从 OpenCore 官方仓库下载 Sample.plist 配置模板',
    status: 'pending',
    icon: <Download className="w-4 h-4" />
  },
  {
    id: 'customize-config',
    name: '自定义配置',
    description: '根据您的硬件配置自定义 OpenCore 设置',
    status: 'pending',
    icon: <Settings className="w-4 h-4" />
  },
  {
    id: 'download-kexts',
    name: '下载驱动文件',
    description: '下载必需的 Kext 驱动文件',
    status: 'pending',
    icon: <Package className="w-4 h-4" />
  },
  {
    id: 'apply-patches',
    name: '应用补丁',
    description: '应用硬件特定的补丁和修复',
    status: 'pending',
    icon: <FileText className="w-4 h-4" />
  },
  {
    id: 'package-efi',
    name: '打包 EFI',
    description: '创建完整的 EFI 文件夹结构',
    status: 'pending',
    icon: <Package className="w-4 h-4" />
  },
  {
    id: 'generate-zip',
    name: '生成下载包',
    description: '将所有文件打包为 ZIP 文件供下载',
    status: 'pending',
    icon: <Download className="w-4 h-4" />
  }
];

export default TaskProgressModal;
export type { TaskProgressModalProps };