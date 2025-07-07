import { Card, CardContent } from '@/components/ui/card';

export const SlideshowSkeleton = () => (
  <Card className="cursor-pointer hover:shadow-lg transition-shadow group">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
      <div className="flex gap-2">
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
); 