import React from 'react';
import { Plus, Trash2, CheckCircle2, Building2, FileText, Users, Bookmark } from 'lucide-react';
import { NonRoutineGroup } from '../types';
import { sound } from '../utils/audio';

interface NonRoutineTasksProps {
  nonRoutine: NonRoutineGroup;
  onChangeNonRoutine: (updated: NonRoutineGroup) => void;
}

interface BucketMeta {
  key: keyof NonRoutineGroup;
  title: string;
  icon: React.ReactNode;
  placeholder: string;
}

const BUCKETS: BucketMeta[] = [
  {
    key: 'followUps',
    title: 'پیگیری‌ها',
    icon: <CheckCircle2 size={16} className="text-[#cde6d8]" />,
    placeholder: 'پیگیری تماس، ایمیل یا وضعیت پروژه...',
  },
  {
    key: 'admin',
    title: 'اداری و سازمانی',
    icon: <Building2 size={16} className="text-[#cde6d8]" />,
    placeholder: 'امور دفتری، حسابداری، تایید فرم‌ها...',
  },
  {
    key: 'docs',
    title: 'مستندات و مکاتبات',
    icon: <FileText size={16} className="text-[#cde6d8]" />,
    placeholder: 'ثبت صورتجلسات، چاپ، بایگانی اسناد...',
  },
  {
    key: 'team',
    title: 'تفویض وظایف تیم',
    icon: <Users size={16} className="text-[#cde6d8]" />,
    placeholder: 'کارهای محول شده به همکاران...',
  },
  {
    key: 'misc',
    title: 'وظایف جانبی و متفرقه',
    icon: <Bookmark size={16} className="text-[#cde6d8]" />,
    placeholder: 'کارهای غیرمنتظره و متفرقه...',
  },
];

export const NonRoutineTasks: React.FC<NonRoutineTasksProps> = ({
  nonRoutine,
  onChangeNonRoutine,
}) => {
  const handleItemChange = (bucketKey: keyof NonRoutineGroup, index: number, value: string) => {
    const list = [...(nonRoutine[bucketKey] || [''])];
    list[index] = value;
    onChangeNonRoutine({
      ...nonRoutine,
      [bucketKey]: list,
    });
  };

  const handleAddItem = (bucketKey: keyof NonRoutineGroup) => {
    sound.playAdd();
    const list = [...(nonRoutine[bucketKey] || []), ''];
    onChangeNonRoutine({
      ...nonRoutine,
      [bucketKey]: list,
    });
  };

  const handleDeleteItem = (bucketKey: keyof NonRoutineGroup, index: number) => {
    const list = [...(nonRoutine[bucketKey] || [])];
    if (list.length <= 1) {
      list[0] = '';
    } else {
      list.splice(index, 1);
    }
    onChangeNonRoutine({
      ...nonRoutine,
      [bucketKey]: list,
    });
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex justify-end">
        <div className="bg-white/95 text-emerald-950 px-4 py-1 rounded-full text-xs font-black shadow-xs mb-0.5">
          کارهای غیر روتین
        </div>
      </div>

      <div className="flex flex-col gap-4 text-white">
        {BUCKETS.map(({ key, title, icon, placeholder }) => {
          const items = nonRoutine[key] && nonRoutine[key].length > 0 ? nonRoutine[key] : [''];

          return (
            <div key={key} className="flex flex-col gap-1.5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleAddItem(key)}
                  className="w-5 h-5 rounded-md bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                  title="افزودن سطر جدید"
                >
                  <Plus size={13} />
                </button>

                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span>{title}</span>
                  <span>{icon}</span>
                </div>
              </div>

              {/* Rows */}
              <div className="flex flex-col gap-2">
                {items.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 border-b border-white/35 pb-1 group"
                  >
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(key, idx)}
                      className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-rose-300 transition-opacity p-0.5 cursor-pointer"
                      title="حذف سطر"
                    >
                      <Trash2 size={12} />
                    </button>

                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleItemChange(key, idx, e.target.value)}
                      placeholder={placeholder}
                      className="flex-1 bg-transparent border-none outline-none text-xs font-medium text-white placeholder-white/40"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
