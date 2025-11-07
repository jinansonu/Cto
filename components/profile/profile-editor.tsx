'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';

export const ProfileEditor = () => {
  const {
    user,
    profile,
    updateProfile,
    uploadAvatar,
    isProfileUpdating,
    isAvatarUploading,
    isProfileLoading,
    profileError
  } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? '');
  }, [profile?.display_name]);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);

    const trimmedName = displayName.trim();

    try {
      await updateProfile({ display_name: trimmedName.length > 0 ? trimmedName : null });
      setStatusMessage('Profile updated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      setStatusMessage(message);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatusMessage(null);

    try {
      await uploadAvatar(file);
      setStatusMessage('Avatar updated.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload avatar';
      setStatusMessage(message);
    } finally {
      event.target.value = '';
    }
  };

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
        You need to sign in to manage your profile.
      </div>
    );
  }

  if (isProfileLoading && !profile) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
        Loading profile…
      </div>
    );
  }

  const currentAvatar = profile?.avatar_url;
  const message = profileError ?? statusMessage;
  const isErrorMessage = Boolean(profileError) || (message ? message.toLowerCase().includes('fail') : false);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40">
        <div>
          <h2 className="text-xl font-semibold text-white">Profile information</h2>
          <p className="mt-1 text-sm text-slate-400">
            Update your display name and avatar. Changes are saved instantly and reflected across the
            app.
          </p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="relative h-20 w-20 overflow-hidden rounded-full border border-slate-700 bg-slate-800"
            >
              {currentAvatar ? (
                <Image
                  src={currentAvatar}
                  alt="Avatar"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-400">
                  {profile?.display_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-[10px] uppercase tracking-wide text-slate-200">
                {isAvatarUploading ? 'Uploading…' : 'Change'}
              </span>
            </button>
            <div className="text-xs text-slate-400">
              <p>Recommended size: square image, min 256×256.</p>
              <p>PNG or JPEG up to 2&nbsp;MB.</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={isAvatarUploading}
          />
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email
              </label>
              <div className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">
                {user?.email}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="displayName" className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Display name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your name"
                className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className={clsx(
                'rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow transition',
                'hover:bg-brand-foreground',
                (isProfileUpdating || isAvatarUploading) && 'cursor-not-allowed opacity-60'
              )}
              disabled={isProfileUpdating || isAvatarUploading}
            >
              {isProfileUpdating ? 'Saving…' : 'Save changes'}
            </button>
            {message && (
              <p className={clsx('text-sm', isErrorMessage ? 'text-red-400' : 'text-emerald-400')}>
                {message}
              </p>
            )}
          </div>
        </form>
      </section>
    </div>
  );
};
