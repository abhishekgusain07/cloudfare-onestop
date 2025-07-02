import { Card, CardContent } from '@/components/ui/card';

export const CollectionSkeleton = () => (
  <Card className="cursor-pointer hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
      <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse mb-3"></div>
      <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
    </CardContent>
  </Card>
); 