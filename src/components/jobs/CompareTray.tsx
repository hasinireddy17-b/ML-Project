import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { useActivity } from '../../contexts/ActivityContext';
import { getFeatureStore } from '../../utils/ml/engineering/featureStore';
import { Button } from '../ui/Button';

export function CompareTray() {
  const { compare, removeCompare, clearCompare } = useActivity();
  const navigate = useNavigate();
  const store = getFeatureStore();
  const jobs = compare.map((id) => store.jobsById.get(id)).filter((j): j is NonNullable<typeof j> => !!j);

  return (
    <AnimatePresence>
      {jobs.length > 0 &&
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className="fixed inset-x-3 bottom-20 z-30 mx-auto max-w-3xl rounded-lg border border-line-strong bg-surface p-3 shadow-lift lg:bottom-6"
        role="region"
        aria-label="Jobs selected for comparison">
        
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
              {jobs.map((j) =>
            <span key={j.job_id} className="inline-flex max-w-[220px] items-center gap-1 rounded-full border border-line bg-cream-100 py-1 pl-3 pr-1 text-sm text-ink">
                  <span className="truncate">{j.job_title}</span>
                  <button type="button" onClick={() => removeCompare(j.job_id)} className="rounded-full p-0.5 text-ink-muted hover:bg-cream-200 hover:text-ink" aria-label={`Remove ${j.job_title} from comparison`}>
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
            )}
              {jobs.length < 3 && <span className="self-center text-sm text-ink-muted">{jobs.length === 1 ? 'Add one more to compare' : 'You can add one more'}</span>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearCompare}>
                Clear
              </Button>
              <Button size="sm" disabled={jobs.length < 2} onClick={() => navigate('/compare')}>
                Compare Jobs ({jobs.length})
              </Button>
            </div>
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}