import { prisma } from "@/lib/db";
import { 
  PlusCircle, 
  RefreshCw, 
  Trash2, 
  FileUp, 
  Activity as ActivityIcon 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const icons = {
  CREATE: <PlusCircle className="w-4 h-4 text-green-500" />,
  UPDATE: <RefreshCw className="w-4 h-4 text-blue-500" />,
  DELETE: <Trash2 className="w-4 h-4 text-red-500" />,
  IMPORT: <FileUp className="w-4 h-4 text-purple-500" />,
};

export async function ActivityFeed({ userId }: { userId: string }) {
  const activities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live</span>
      </div>

      <div className="p-5 flex-1">
        <div className="space-y-6">
          {activities.map((item) => (
            <div key={item.id} className="relative flex gap-4">
              <div className="absolute left-4 top-8 bottom-[-24px] w-[1px] bg-gray-100 last:hidden" />
              
              <div className="relative z-10 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                {icons[item.action as keyof typeof icons] || <ActivityIcon className="w-4 h-4 text-gray-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {item.entityName} <span className="text-gray-500 font-normal">({item.entityType.toLowerCase()})</span>
                  </p>
                  <span className="text-[12px] text-gray-400 whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {item.details}
                </p>
              </div>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-gray-400 italic">No activities logged yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}