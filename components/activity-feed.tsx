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
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-2">
          <ActivityIcon className="h-5 w-5 shrink-0 text-gray-400" />
          <h3 className="truncate font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-gray-400">Live</span>
      </div>

      <div className="flex-1 p-4 sm:p-5">
        <div className="space-y-6">
          {activities.map((item) => (
            <div key={item.id} className="relative flex gap-4">
              <div className="absolute left-4 top-8 bottom-[-24px] w-[1px] bg-gray-100 last:hidden" />
              
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm">
                {icons[item.action as keyof typeof icons] || <ActivityIcon className="w-4 h-4 text-gray-400" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="w-full min-w-0 truncate text-sm font-semibold text-gray-900">
                    {item.entityName} <span className="font-normal text-gray-500">({item.entityType.toLowerCase()})</span>
                  </p>
                  <span className="whitespace-nowrap text-[11px] text-gray-400 sm:ml-2 sm:text-[12px]">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
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