import React, { useRef, useEffect } from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all' | 'additions text' | 'additions removals' | 'removals additions' | 'removals text' | 'text additions' | 'text removals';
  className?: string;
}

/**
 * Accessibility live region for announcing streaming content to screen readers
 * Used for real-time updates during message streaming
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  politeness = 'polite',
  atomic = true,
  relevant = 'additions text',
  className = 'sr-only',
}) => {
  const regionRef = useRef<HTMLDivElement>(null);
  const previousMessage = useRef<string>('');

  useEffect(() => {
    // Only announce new content to avoid overwhelming screen readers
    if (message && message !== previousMessage.current) {
      previousMessage.current = message;

      // Small delay to ensure screen readers pick up the change
      const timeoutId = setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [message]);

  return (
    <div
      ref={regionRef}
      className={className}
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      role="status"
    />
  );
};

/**
 * Specialized live region for streaming chat messages
 * Announces message updates during streaming with appropriate delays
 */
interface StreamingLiveRegionProps {
  isStreaming: boolean;
  currentContent: string;
  onStreamStart?: () => void;
  onStreamEnd?: () => void;
  className?: string;
}

export const StreamingLiveRegion: React.FC<StreamingLiveRegionProps> = ({
  isStreaming,
  currentContent,
  onStreamStart,
  onStreamEnd,
  className = 'sr-only',
}) => {
  const [announcementText, setAnnouncementText] = React.useState<string>('');
  const streamingStarted = useRef<boolean>(false);
  const lastUpdateTime = useRef<number>(0);

  useEffect(() => {
    if (isStreaming && !streamingStarted.current) {
      streamingStarted.current = true;
      setAnnouncementText('Получение ответа...');
      onStreamStart?.();
    } else if (!isStreaming && streamingStarted.current) {
      streamingStarted.current = false;
      setAnnouncementText('Ответ получен');
      onStreamEnd?.();
    }
  }, [isStreaming, onStreamStart, onStreamEnd]);

  useEffect(() => {
    if (isStreaming && currentContent) {
      const now = Date.now();

      // Throttle announcements to avoid overwhelming screen readers
      // Only announce every 2 seconds during streaming
      if (now - lastUpdateTime.current > 2000) {
        lastUpdateTime.current = now;
        const wordCount = currentContent.split(' ').length;
        setAnnouncementText(`Получено слов: ${wordCount}`);
      }
    }
  }, [isStreaming, currentContent]);

  return (
    <LiveRegion
      message={announcementText}
      politeness="polite"
      className={className}
    />
  );
};

/**
 * Live region for announcing errors and important status changes
 */
interface StatusLiveRegionProps {
  status: string;
  level?: 'info' | 'warning' | 'error';
  className?: string;
}

export const StatusLiveRegion: React.FC<StatusLiveRegionProps> = ({
  status,
  level = 'info',
  className = 'sr-only',
}) => {
  const politeness = level === 'error' ? 'assertive' : 'polite';

  return (
    <LiveRegion
      message={status}
      politeness={politeness}
      className={className}
    />
  );
};

/**
 * Hook for managing multiple live regions in a component
 */
export const useLiveRegions = () => {
  const [streamingStatus, setStreamingStatus] = React.useState<string>('');
  const [errorStatus, setErrorStatus] = React.useState<string>('');
  const [generalStatus, setGeneralStatus] = React.useState<string>('');

  const announceStreaming = React.useCallback((message: string) => {
    setStreamingStatus(message);
  }, []);

  const announceError = React.useCallback((error: string) => {
    setErrorStatus(error);
    // Clear error after announcement
    setTimeout(() => setErrorStatus(''), 3000);
  }, []);

  const announceStatus = React.useCallback((status: string) => {
    setGeneralStatus(status);
    // Clear status after announcement
    setTimeout(() => setGeneralStatus(''), 2000);
  }, []);

  const clearAll = React.useCallback(() => {
    setStreamingStatus('');
    setErrorStatus('');
    setGeneralStatus('');
  }, []);

  return {
    streamingStatus,
    errorStatus,
    generalStatus,
    announceStreaming,
    announceError,
    announceStatus,
    clearAll,
  };
};
