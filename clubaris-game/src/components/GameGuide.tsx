import { useGameStore } from "../store/gameStore";
import { Joyride, STATUS } from "react-joyride";
import { useLocation } from "react-router-dom";
import { useTranslation } from "../utils/i18n";

export default function GameGuide() {
  const { isTourRunning, stopTour, language } = useGameStore();
  const t = useTranslation();
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
      target: ".tour-step-team",
      content: language === 'pt' 
         ? 'Aqui você acompanha a saúde financeira e a confiança da sua diretoria e torcida.' 
         : 'Here you track the financial health and confidence of your board and fans.',
      disableBeacon: true,
      placement: "right" as const,
    },
    {
      target: ".tour-step-next-match",
      content: language === 'pt'
         ? 'Fique de olho no seu próximo adversário. Prepare-se bem!'
         : 'Keep an eye on your next opponent. Be prepared!',
      placement: "right" as const,
    },
    {
      target: ".tour-step-squad",
      content: language === 'pt'
         ? 'Seu elenco principal. Use as abas acima para escalar ou buscar novos talentos!'
         : 'Your main squad. Use the tabs above to setup tactics or scout new talent!',
      placement: "left" as const,
    }
  ];

  if (!isTourRunning) return null;

  const JoyrideComponent: any = Joyride;

  return (
    <JoyrideComponent
      steps={steps}
      run={isTourRunning && location.pathname === '/clubhouse'}
      continuous
      scrollToFirstStep
      callback={handleJoyrideCallback}
      styles={({
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
      }) as any}
    />
  );
}
