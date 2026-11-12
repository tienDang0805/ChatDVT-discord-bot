import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CompactHeader } from './components/CompactHeader';
import { FloatingRestBar } from './components/FloatingRestBar';
import { SvgIcon } from './components/Icons';
import { OnboardingModal } from './components/OnboardingModal';
import { useChatDvtAvatar } from './hooks/useChatDvtAvatar';
import { useGymStore } from './hooks/useGymStore';
import { useNativeWebPush } from './hooks/useNativeWebPush';
import { useUltraMode } from './hooks/useUltraMode';
import { useWallClockRestTimer } from './hooks/useWallClockRestTimer';
import type { ActiveTabId, WorkoutSessionId } from './types/gym';
import { BodyAndSettingsView } from './views/BodyAndSettingsView';
import { ChatDvtCoachView } from './views/ChatDvtCoachView';
import { NutritionView } from './views/NutritionView';
import { ScheduleView } from './views/ScheduleView';
import { StreakAndPrView } from './views/StreakAndPrView';
import { WorkoutView } from './views/WorkoutView';

function resolveInitialTab(): ActiveTabId {
  if (typeof window === 'undefined') return 'coach';
  const params = new URLSearchParams(window.location.search);
  const t = params.get('tab');
  if (
    t === 'coach' ||
    t === 'schedule' ||
    t === 'workout' ||
    t === 'streak' ||
    t === 'nutrition' ||
    t === 'profile'
  ) {
    return t;
  }
  return 'coach';
}

function isTextEntryElement(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag === 'INPUT') {
    const type = ((el as HTMLInputElement).type || 'text').toLowerCase();
    return !['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'range'].includes(type);
  }
  return (el as HTMLElement).isContentEditable === true;
}

export const Gym8dApp: React.FC = () => {
  const store = useGymStore();
  const { avatarUrl, fallbackUrl } = useChatDvtAvatar();
  const [activeTab, setActiveTab] = useState<ActiveTabId>(() => resolveInitialTab());
  const [profileSection, setProfileSection] = useState<'push' | 'body'>('body');
  const [coachDraft, setCoachDraft] = useState<string>('');
  const [returnTarget, setReturnTarget] = useState<{
    tab: ActiveTabId;
    label: string;
  } | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);

  const mainScrollRef = useRef<HTMLElement | null>(null);

  const push = useNativeWebPush(store.state.syncCode, store.state.pushPrefs);
  const ultra = useUltraMode();

  const rest = useWallClockRestTimer(
    store.state.syncCode,
    push.pushStatus === 'subscribed' && store.state.pushPrefs.restTimerPush
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const vv = window.visualViewport;
    let blurTimer: number | null = null;

    const isTouchDevice =
      push.env.isMobile ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) ||
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');

    const syncViewport = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
      const fullH = window.innerHeight;
      const curH = vv ? vv.height : fullH;
      const curTop = vv ? Math.max(0, vv.offsetTop) : 0;
      root.style.setProperty('--g8d-vv-height', `${Math.round(curH)}px`);
      root.style.setProperty('--g8d-vv-top', `${Math.round(curTop)}px`);

      const inset = Math.max(0, fullH - curH - curTop);
      const focusedText = isTextEntryElement(document.activeElement);
      setIsKeyboardOpen(inset > 44 || (isTouchDevice && focusedText));
    };

    const handleFocusIn = (ev: FocusEvent) => {
      if (blurTimer !== null) {
        window.clearTimeout(blurTimer);
        blurTimer = null;
      }
      if (isTextEntryElement(ev.target as Element | null) && isTouchDevice) {
        setIsKeyboardOpen(true);
      }
      window.requestAnimationFrame(syncViewport);
      window.setTimeout(syncViewport, 120);
      window.setTimeout(syncViewport, 320);
    };

    const handleFocusOut = () => {
      if (blurTimer !== null) window.clearTimeout(blurTimer);
      blurTimer = window.setTimeout(() => {
        if (!isTextEntryElement(document.activeElement)) {
          window.scrollTo(0, 0);
        }
        syncViewport();
      }, 90);
    };

    syncViewport();
    vv?.addEventListener('resize', syncViewport);
    vv?.addEventListener('scroll', syncViewport);
    window.addEventListener('resize', syncViewport);
    window.addEventListener('scroll', syncViewport, { passive: true });
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      if (blurTimer !== null) window.clearTimeout(blurTimer);
      vv?.removeEventListener('resize', syncViewport);
      vv?.removeEventListener('scroll', syncViewport);
      window.removeEventListener('resize', syncViewport);
      window.removeEventListener('scroll', syncViewport);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      root.style.removeProperty('--g8d-vv-height');
      root.style.removeProperty('--g8d-vv-top');
    };
  }, [push.env.isMobile]);

  useEffect(() => {
    const splash = document.getElementById('app-splash');
    if (splash) {
      splash.style.opacity = '0';
      const t = setTimeout(() => splash.remove(), 200);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (mainScrollRef.current && activeTab !== 'coach') {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  useEffect(() => {
    if (!store.toast) return;
    const t = setTimeout(() => store.dismissToast(), 3200);
    return () => clearTimeout(t);
  }, [store.dismissToast, store.toast]);

  const openWorkoutForDate = (isoDate: string, sessionId?: WorkoutSessionId) => {
    store.setSelectedDateISO(isoDate);
    if (sessionId) {
      store.updateState((prev) => ({ ...prev, activeSessionId: sessionId }));
    }
    setActiveTab('workout');
  };

  const openPushSettings = () => {
    setProfileSection('push');
    setActiveTab('profile');
  };

  const openCoachFromContext = useCallback(
    (prefill?: string, returnLabel?: string) => {
      if (activeTab !== 'coach' && returnLabel) {
        setReturnTarget({ tab: activeTab, label: returnLabel });
      }
      if (prefill) {
        setCoachDraft(prefill);
      }
      setActiveTab('coach');
    },
    [activeTab]
  );

  const consumeCoachDraft = useCallback(() => {
    setCoachDraft('');
  }, []);

  const showInstallStrip =
    store.state.hasOnboarded &&
    !push.env.isStandalonePWA &&
    (push.env.isMobile || push.env.isInAppBrowser) &&
    !store.state.installBannerDismissed;

  const isScheduleGroup = activeTab === 'schedule' || activeTab === 'streak';

  return (
    <div
      className={`g8d-shell ${activeTab === 'coach' ? 'is-coach-mode' : ''} ${
        isKeyboardOpen ? 'is-keyboard-open' : ''
      }`}
    >
      <CompactHeader
        streakCount={store.streakSummary.currentStreak}
        syncStatus={store.syncStatus}
        syncCode={store.state.syncCode}
        pushStatus={push.pushStatus}
        env={push.env}
        showInstallStrip={showInstallStrip}
        canPromptNativeInstall={push.canPromptNativeInstall}
        onPromptNativeInstall={push.promptNativeInstall}
        onDismissInstallStrip={() =>
          store.updateState((prev) => ({ ...prev, installBannerDismissed: true }))
        }
        onOpenStreak={() => setActiveTab('streak')}
        onOpenPushSettings={openPushSettings}
        onQuickSync={() => store.pushToCloud(store.state, store.state.syncCode, true, true)}
      />

      {store.toast && (
        <div
          className={`g8d-toast ${
            store.toast.tone === 'gold'
              ? 'is-gold'
              : store.toast.tone === 'green'
              ? 'is-green'
              : ''
          }`}
          onClick={store.dismissToast}
        >
          <div className="g8d-toast-title">{store.toast.title}</div>
          <div className="g8d-toast-body">{store.toast.body}</div>
        </div>
      )}

      <main
        ref={mainScrollRef}
        className={`g8d-main ${activeTab === 'coach' ? 'is-coach-main' : ''}`}
      >
        {activeTab === 'coach' && (
          <ChatDvtCoachView
            isKeyboardOpen={isKeyboardOpen}
            initialDraft={coachDraft}
            onConsumeDraft={consumeCoachDraft}
            returnTab={returnTarget}
            onReturnToTab={
              returnTarget
                ? () => {
                    const dest = returnTarget.tab;
                    setReturnTarget(null);
                    setActiveTab(dest);
                  }
                : undefined
            }
            todayISO={store.todayISO}
            selectedDay={store.selectedDay}
            effectiveSessionId={store.effectiveSessionId}
            state={store.state}
            metrics={store.metrics}
            timeline14={store.streakSummary.timeline14}
            currentStreak={store.streakSummary.currentStreak}
            bestStreak={store.streakSummary.bestStreak}
            personalRecords={store.personalRecords}
            nutritionTotals={store.nutritionTotalsForSelectedDate}
            messages={store.state.agentMessages || []}
            onSetMessages={store.setAgentMessages}
            onToggleAutoApply={(enabled) =>
              store.updateState((prev) => ({ ...prev, agentAutoApply: enabled }))
            }
            onChangePersona={store.setCoachPersona}
            onApplyProposals={store.applyAgentProposals}
            onRestoreSnapshot={store.restoreSnapshot}
            ultra={ultra}
            onOpenUltraSettings={() => {
              setProfileSection('push');
              setActiveTab('profile');
            }}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            todayISO={store.todayISO}
            selectedDay={store.selectedDay}
            tomorrowEntry={store.tomorrowEntry}
            weeklyPattern={store.state.weeklyPattern}
            dayNotesByDate={store.state.dayNotesByDate || {}}
            nextRestDayForMakeup={store.streakSummary.nextRestDayForMakeup}
            dynamicWeek={store.dynamicWeek}
            dynamicMonth={store.dynamicMonth}
            metrics={store.metrics}
            weightTracker={store.weightTracker}
            weighInIntervalDays={store.state.weighInIntervalDays}
            pushSubscribed={push.pushStatus === 'subscribed'}
            onSelectDate={store.setSelectedDateISO}
            onChangeWeekOffset={store.setWeekOffset}
            onChangeMonthOffset={store.setMonthOffset}
            onOpenWorkoutForDate={openWorkoutForDate}
            onSetDayStatus={(isoDate, st, pref) => {
              store.setDayStatus(isoDate, st, pref);
            }}
            onMarkDayOff={store.markDayOff}
            onRestoreDayWorkout={store.restoreDayWorkout}
            onSetDayNote={store.setDayNote}
            onApplyWeeklySplitPreset={store.applyWeeklySplitPreset}
            onMakeupMissed={store.makeupMissedSession}
            onUpdateDaySchedule={store.updateScheduleForDay}
            onLogWeight={store.logNewWeight}
            onChangeWeighInterval={(days) =>
              store.updateState((prev) => ({ ...prev, weighInIntervalDays: days }))
            }
            onOpenPushSettings={openPushSettings}
            onOpenCoach={openCoachFromContext}
          />
        )}

        {activeTab === 'workout' && (
          <WorkoutView
            todayISO={store.todayISO}
            selectedDay={store.selectedDay}
            weekDays={store.dynamicWeek.days}
            effectiveSessionId={store.effectiveSessionId}
            selectedGymId={store.state.selectedGymId}
            barbellWeightKg={store.state.profileInput.barbellWeightKg || 20}
            logsByDate={store.state.logsByDate}
            sessionSwaps={store.state.sessionSwaps}
            customSessionLists={store.state.customSessionLists}
            activePresetBySession={store.state.activePresetBySession}
            personalRecords={store.personalRecords}
            onSelectDate={store.setSelectedDateISO}
            onSelectSession={(sid) =>
              store.updateState((prev) => ({ ...prev, activeSessionId: sid }))
            }
            onSelectGymBranch={(gid) =>
              store.updateState((prev) => ({ ...prev, selectedGymId: gid }))
            }
            onApplyGymPreset={store.applyGymPreset}
            onMutateSets={store.mutateExerciseSets}
            onSwapExercise={store.swapExerciseInSlot}
            onAddExercise={store.addExerciseToSession}
            onRemoveExercise={store.removeExerciseFromSession}
            onFinishDayDone={(isoDate, sid) => {
              store.setDayStatus(isoDate, 'done', sid);
            }}
            onUndoDayDone={(isoDate) => {
              store.setDayStatus(isoDate, null);
            }}
            onMarkDayOff={store.markDayOff}
            onRestoreDayWorkout={store.restoreDayWorkout}
            onOpenCoach={openCoachFromContext}
            onStartRestTimer={rest.startRestTimer}
          />
        )}

        {activeTab === 'streak' && (
          <StreakAndPrView
            streakSummary={store.streakSummary}
            personalRecords={store.personalRecords}
            dayNotesByDate={store.state.dayNotesByDate || {}}
            onOpenWorkoutForDate={openWorkoutForDate}
            onMakeupMissed={store.makeupMissedSession}
            onOpenCoach={openCoachFromContext}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionView
            todayISO={store.todayISO}
            nutritionDateISO={store.nutritionDateISO}
            metrics={store.metrics}
            totals={store.nutritionTotalsForSelectedDate}
            onChangeDate={store.setNutritionDateISO}
            onAddWater={store.addWaterMl}
            onAdjustFoodServing={store.adjustFoodServing}
            onAddCustomMacro={store.addCustomMacroEntry}
            onRemoveCustomMacro={store.removeCustomMacroEntry}
            onOpenCoach={openCoachFromContext}
          />
        )}

        {activeTab === 'profile' && (
          <BodyAndSettingsView
            initialSection={profileSection}
            metrics={store.metrics}
            streakSummary={store.streakSummary}
            personalRecords={store.personalRecords}
            dayNotesByDate={store.state.dayNotesByDate || {}}
            syncCode={store.state.syncCode}
            lastSyncedAt={store.state.lastSyncedAt}
            syncStatus={store.syncStatus}
            selectedGymId={store.state.selectedGymId}
            coachPersona={store.state.coachPersona === 'savage' ? 'savage' : 'standard'}
            pushPrefs={store.state.pushPrefs}
            pushStatus={push.pushStatus}
            activeDevicesCount={push.activeDevicesCount}
            testPushCountdown={push.testPushCountdown}
            pushStatusMessage={push.pushStatusMessage}
            env={push.env}
            canPromptNativeInstall={push.canPromptNativeInstall}
            onPromptNativeInstall={push.promptNativeInstall}
            weekDays={store.dynamicWeek.days}
            onUpdateProfileField={store.updateProfileField}
            onChangePersona={store.setCoachPersona}
            onUpdatePushPref={store.updatePushPref}
            onSubscribePush={push.subscribeNativePush}
            onUnsubscribePush={push.unsubscribeNativePush}
            onTriggerTestPush={push.triggerLockScreenTestPush}
            onSelectGymBranch={(gid) =>
              store.updateState((prev) => ({ ...prev, selectedGymId: gid }))
            }
            onSyncNow={() => store.pushToCloud(store.state, store.state.syncCode, true, true)}
            onPullCloud={() => store.pullFromCloud(store.state.syncCode, true)}
            onChangeSyncCode={store.setSyncCodeAndPull}
            onExportJSON={store.exportBackupJSON}
            onImportJSON={store.importBackupJSON}
            onResetConfirmed={store.resetAllDataConfirmed}
            onOpenWorkoutForDate={openWorkoutForDate}
            onMakeupMissed={store.makeupMissedSession}
            onOpenCoach={openCoachFromContext}
            ultra={ultra}
          />
        )}
      </main>

      <FloatingRestBar
        timer={rest.restTimer}
        onAdjust={rest.adjustRestTimer}
        onStop={rest.stopRestTimer}
      />

      <OnboardingModal
        open={!store.state.hasOnboarded}
        syncCode={store.state.syncCode}
        onCompleteSetup={store.completeOnboarding}
        onRestoreCode={store.restoreExistingCodeOnOnboarding}
      />

      <nav className="g8d-bottom-nav" aria-label="Điều hướng chính">
        <button
          type="button"
          className={isScheduleGroup ? 'is-active' : ''}
          aria-current={isScheduleGroup ? 'page' : undefined}
          onClick={() => setActiveTab('schedule')}
        >
          <span className="g8d-tab-icon-slot">
            <SvgIcon name="calendar" size={22} filled={isScheduleGroup} />
          </span>
          <span>Lịch</span>
        </button>

        <button
          type="button"
          className={activeTab === 'workout' ? 'is-active' : ''}
          aria-current={activeTab === 'workout' ? 'page' : undefined}
          onClick={() => setActiveTab('workout')}
        >
          <span className="g8d-tab-icon-slot">
            <SvgIcon name="dumbbell" size={22} filled={activeTab === 'workout'} />
          </span>
          <span>Buổi Tập</span>
        </button>

        <button
          type="button"
          className={`g8d-nav-coach-btn ${activeTab === 'coach' ? 'is-active' : ''}`}
          aria-current={activeTab === 'coach' ? 'page' : undefined}
          onClick={() => {
            setReturnTarget(null);
            setActiveTab('coach');
          }}
        >
          <span className="g8d-nav-coach-avatar-wrap">
            <img
              src={avatarUrl}
              alt="ChatDVT"
              width={26}
              height={26}
              onError={(e) => {
                if (!e.currentTarget.src.endsWith(fallbackUrl)) {
                  e.currentTarget.src = fallbackUrl;
                }
              }}
            />
          </span>
          <span>ChatDVT</span>
        </button>

        <button
          type="button"
          className={activeTab === 'nutrition' ? 'is-active' : ''}
          aria-current={activeTab === 'nutrition' ? 'page' : undefined}
          onClick={() => setActiveTab('nutrition')}
        >
          <span className="g8d-tab-icon-slot">
            <SvgIcon name="utensils" size={22} filled={activeTab === 'nutrition'} />
          </span>
          <span>Dinh Dưỡng</span>
        </button>

        <button
          type="button"
          className={activeTab === 'profile' ? 'is-active' : ''}
          aria-current={activeTab === 'profile' ? 'page' : undefined}
          onClick={() => {
            setProfileSection('body');
            setActiveTab('profile');
          }}
        >
          <span className="g8d-tab-icon-slot">
            <SvgIcon name="user" size={22} filled={activeTab === 'profile'} />
          </span>
          <span>Hồ Sơ</span>
        </button>
      </nav>
    </div>
  );
};
