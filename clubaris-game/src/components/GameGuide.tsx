import { useGameStore } from "../store/gameStore";
import Joyride, { STATUS } from "react-joyride";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "../utils/i18n";
import { useEffect, useState } from "react";

export default function GameGuide() {
  const { isTourRunning, stopTour, language } = useGameStore();
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      stopTour();
    }
  };

  const steps = [
    {
      target: ".tour-step-dashboard",
      content: t('tour_step1', language),
      disableBeacon: true,
      placement: "bottom" as const,
    },
    {
      target: ".tour-step-league",
      content: t('tour_step2', language),
      placement: "top" as const,
    },
    {
      target: ".tour-step-nav-tactics",
      content: t('tour_step3', language),
      placement: "top" as const,
    }
  ];

  if (!isTourRunning) return null;

  return (
    <Joyride
      steps={steps}
      run={isTourRunning && location.pathname === '/dashboard'}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#000000",
          backgroundColor: "#F9FAFB",
          textColor: "#000000",
        },
        buttonNext: {
          backgroundColor: "#4ade80",
          borderRadius: 0,
          color: "#000",
          border: "2px solid #000",
          boxShadow: "2px 2px 0 0 #000",
          fontWeight: "bold",
        },
        buttonBack: {
          color: "#000",
          fontWeight: "bold",
        },
        buttonSkip: {
          color: "#ef4444",
          fontWeight: "bold",
        },
        tooltip: {
          borderRadius: 0,
          border: "2px solid #000",
          boxShadow: "4px 4px 0 0 #000",
        }
      }}
    />
  );
}
