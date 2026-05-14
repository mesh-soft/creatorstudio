import * as React from 'react';
import { TinaCMS } from '@toolkit/tina-cms';
import { CMSContext } from '@toolkit/react-tinacms/use-cms';
import { initialState, tinaReducer } from '@toolkit/tina-state';

export interface TinaCMSProviderProps {
  cms: TinaCMS;
  children?: React.ReactNode;
}

export const INVALID_CMS_ERROR =
  'The `cms` prop must be an instance of `TinaCMS`.';

export const TinaCMSProvider: React.FC<TinaCMSProviderProps> = ({
  cms,
  children,
}) => {
  const [state, dispatch] = React.useReducer(tinaReducer, cms, initialState);
  
  const lastUrlRef = React.useRef<string>('');
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleLocationChange = () => {
      const currentUrl = window.location.href;
      if (currentUrl === lastUrlRef.current) return;
      lastUrlRef.current = currentUrl;
      dispatch({ type: 'set-url', value: currentUrl });
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);

    // STATE-BASED SYNC: Subscribe to all form changes and broadcast draft state
    const broadcastDraft = (values: any) => {
      if (!values) return;
      window.parent.postMessage({
        type: 'studio:draft-update',
        payload: values,
        source: 'tina-state'
      }, '*');
    };

    // Subscribe to existing forms
    const unsubscribes: (() => void)[] = [];
    cms.plugins.all('form').forEach((form: any) => {
      unsubscribes.push(form.subscribe((state: any) => {
        broadcastDraft(state.values);
      }, { values: true }));
    });

    // Watch for new forms being added (e.g. on navigation)
    const unsubPlugin = cms.events.subscribe('plugin:add:form', (event: any) => {
      const form = event.plugin;
      unsubscribes.push(form.subscribe((state: any) => {
        broadcastDraft(state.values);
      }, { values: true }));
    });

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      unsubscribes.forEach(unsub => unsub());
      unsubPlugin();
    };
  }, [cms, dispatch]);

  // Sync active CSS across iframes (Admin -> Parent -> Preview)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Broadcast outward
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'TINA_ACTIVE_CSS', value: state.activeCss }, '*');
    }

    // Listen for incoming sync
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'TINA_ACTIVE_CSS') {
        // Only update if it's different to avoid loops
        if (JSON.stringify(e.data.value) !== JSON.stringify(state.activeCss)) {
          dispatch({ type: 'set-active-css', value: e.data.value });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [state.activeCss, dispatch]);

  if (!(cms instanceof TinaCMS)) {
    throw new Error(INVALID_CMS_ERROR);
  }

  return (
    <CMSContext.Provider value={{ cms, state, dispatch }}>
      <LiveStyles activeCss={state.activeCss} />
      {children}
    </CMSContext.Provider>
  );
};

const LiveStyles = ({ activeCss }: { activeCss: { id: string, css: string } | null }) => {
  if (!activeCss) return null;

  try {
    const cssObj = JSON.parse(activeCss.css);
    const cssRules = Object.entries(cssObj)
      .map(([k, v]) => `${k.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}: ${v} !important;`)
      .join(' ');

    // Target the specific block container if possible
    // Field name is like "blocks.0.css", container is "blocks.0"
    const fieldId = activeCss.id.replace(/\.css$/, '');
    const selector = fieldId.includes('.') 
      ? `#tina-${fieldId.replace(/\./g, '-')}` 
      : `[data-tina-field="${fieldId}"]`;
    
    return (
      <style dangerouslySetInnerHTML={{
        __html: `${selector} { ${cssRules} }`
      }} />
    );
  } catch (e) {
    return null;
  }
};
