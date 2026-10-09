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
    icon: <CheckCircle2 size={15} className="text-stone-500 dark:text-stone-400" />,
    placeholder: 'پیگیری تماس، ایمیل یا وضعیت پروژه...',
  },
  {
    key: 'admin',
    title: 'اداری و سازمانی',
    icon: <Building2 size={15} className="text-stone-500 dark:text-stone-400" />,
    placeholder: 'امور دفتری، حسابداری، تایید فرم‌ها...',
  },
  {
    key: 'docs',
    title: 'مستندات و مکاتبات',
    icon: <FileText size={15} className="text-stone-500 dark:text-stone-400" />,
    placeholder: 'ثبت صورتجلسات، اسناد...',
  },
  {
    key: 'team',
    title: 'تفویض وظایف تیم',
    icon: <Users size={15} className="text-stone-500 dark:text-stone-400" />,
    placeholder: 'کارهای محول شده به همکاران...',
  },
  {
    key: 'misc',
    title: 'وظایف جانبی و متفرقه',
    icon: <Bookmark size={15} className="text-stone-500 dark:text-stone-400" />,
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
    <section className="flex flex-col gap-4">
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 text-stone-900 dark:text-stone-100 flex flex-col gap-4 border border-stone-200/70 dark:border-stone-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between border-b border-stone-200/50 dark:border-stone-800 pb-2">
          <h3 className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 tracking-tight">
            کارهای غیرروتین و تفویضی
          </h3>
          <span className="text-[10px] text-stone-400 font-medium">دسته‌بندی موضوعی</span>
        </div>

        <div className="flex flex-col gap-3.5">
          {BUCKETS.map(({ key, title, icon, placeholder }) => {
            const items = nonRoutine[key] && nonRoutine[key].length > 0 ? nonRoutine[key] : [''];

            return (
              <div key={key} className="flex flex-col gap-1.5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
                    {icon}
                    <span>{title}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddItem(key)}
                    className="w-5 h-5 rounded-md text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer"
                    title="افزودن سطر جدید"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Rows */}
                <div className="flex flex-col gap-1 pr-5">
                  {items.map((val, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 border-b border-stone-150/70 dark:border-stone-800/70 pb-1 group"
                    >
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleItemChange(key, idx, e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent border-none outline-none text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 font-normal"
                      />

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(key, idx)}
                        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-500 transition-opacity p-0.5 cursor-pointer"
                        title="حذف سطر"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
