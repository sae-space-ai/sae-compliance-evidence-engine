/**
 * ModuleHeader — Standard header for each module panel.
 */

export function ModuleHeader({
  module,
  title,
  description,
}: {
  module: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-white">
          {module}
        </span>
      </div>
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-500 mt-0.5">{description}</p>
    </div>
  );
}
