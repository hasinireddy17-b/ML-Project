import React, { type ReactNode } from 'react';
import { Button } from '../ui/Button';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  dirty?: boolean;
  saving?: boolean;
  onSave?: () => void;
  onReset?: () => void;
}

export function SettingsSection({ title, description, children, dirty = false, saving = false, onSave, onReset }: SettingsSectionProps) {
  return (
    <section aria-labelledby={`settings-${title}`}>
      <h2 id={`settings-${title}`} className="text-xl font-semibold text-ink">
        {title}
      </h2>
      {description && <p className="mt-1 text-[15px] text-ink-soft">{description}</p>}
      <div className="mt-6 space-y-6">{children}</div>
      {onSave &&
      <div className="sticky bottom-20 z-10 mt-8 flex items-center justify-end gap-2 border-t border-line bg-cream py-4 lg:bottom-0">
          {dirty && <span className="mr-auto text-sm text-ink-muted">You have unsaved changes</span>}
          {onReset &&
        <Button variant="ghost" onClick={onReset} disabled={!dirty || saving}>
              Discard
            </Button>
        }
          <Button onClick={onSave} disabled={!dirty} loading={saving}>
            Save changes
          </Button>
        </div>
      }
    </section>);

}