import React, { useEffect, useMemo, useState } from 'react';
import type { AlertFrequency } from '../../types/activity';
import type { ExperienceLevel, WorkMode } from '../../types/job';
import type { AlertInput } from '../../contexts/ActivityContext';
import { experienceLevels, locations, workModes } from '../../data/skills';
import { alertMatchCount } from '../../utils/alerts';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { SelectField } from '../ui/SelectField';
import { Chip } from '../ui/Chip';
import { SkillPicker } from '../profile/SkillPicker';

interface AlertFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: AlertInput) => void;
}

export function AlertFormModal({ open, onClose, onSubmit }: AlertFormModalProps) {
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [location, setLocation] = useState('Any');
  const [workMode, setWorkMode] = useState<WorkMode | 'Any'>('Any');
  const [experience, setExperience] = useState<ExperienceLevel | 'Any'>('Any');
  const [frequency, setFrequency] = useState<AlertFrequency>('Daily');
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) return;
    setRole('');
    setSkills([]);
    setLocation('Any');
    setWorkMode('Any');
    setExperience('Any');
    setFrequency('Daily');
    setName('');
    setNameTouched(false);
    setError('');
  }, [open]);

  const autoName = `${role.trim() || skills[0] || 'New'} Jobs${location !== 'Any' ? ` in ${location}` : workMode === 'Remote' ? ' · Remote' : ''}`;
  const finalName = nameTouched && name.trim() ? name.trim() : autoName;
  const criteria = { role: role.trim(), skills, location, work_mode: workMode, experience };
  const matching = useMemo(() => role.trim() || skills.length ? alertMatchCount(criteria) : null, [role, skills, location, workMode, experience]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => {
    if (!role.trim() && !skills.length) {
      setError('Add a role or at least one skill.');
      return;
    }
    onSubmit({ ...criteria, name: finalName, frequency });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Create a job alert"
      description="We’ll let you know when new jobs match — no more than you asked for."
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Create alert</Button>
        </>
      }>
      
      <div className="space-y-5">
        <TextField label="Role" value={role} onChange={(e) => {setRole(e.target.value);setError('');}} placeholder="e.g. Python Developer" error={error} />
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Skills</p>
          <SkillPicker value={skills} onChange={(s) => {setSkills(s);setError('');}} max={6} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} options={[{ value: 'Any', label: 'Any location' }, ...locations.filter((l) => l !== 'Remote').map((l) => ({ value: l, label: l }))]} />
          <SelectField label="Work mode" value={workMode} onChange={(e) => setWorkMode(e.target.value as WorkMode | 'Any')} options={[{ value: 'Any', label: 'Any' }, ...workModes.map((m) => ({ value: m, label: m }))]} />
          <SelectField label="Experience" value={experience} onChange={(e) => setExperience(e.target.value as ExperienceLevel | 'Any')} options={[{ value: 'Any', label: 'Any level' }, ...experienceLevels.map((l) => ({ value: l, label: l }))]} />
        </div>
        <fieldset>
          <legend className="text-sm font-medium text-ink">Frequency</legend>
          <div className="mt-2 flex gap-2">
            {(['Daily', 'Weekly'] as AlertFrequency[]).map((f) =>
            <Chip key={f} selected={frequency === f} onClick={() => setFrequency(f)}>
                {f}
              </Chip>
            )}
          </div>
        </fieldset>
        <TextField
          label="Alert name"
          value={nameTouched ? name : autoName}
          onChange={(e) => {
            setNameTouched(true);
            setName(e.target.value);
          }}
          hint={matching === null ? 'Add a role or skills to preview matches.' : `${matching} ${matching === 1 ? 'job matches' : 'jobs match'} right now.`} />
        
      </div>
    </Modal>);

}