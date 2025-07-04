import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface ConnectionStatusProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await api.testConnection();
      setIsConnected(result.success);
      setMessage(result.success ? result.data?.message || 'Connected' : result.error || 'Connection failed');
      onConnectionChange?.(result.success);
    } catch (error) {
      setIsConnected(false);
      setMessage('Connection test failed');
      onConnectionChange?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusColor = () => {
    if (isConnected === null) return '#6b7280'; // gray
    return isConnected ? '#77a361' : '#ef4444'; // green or red
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
    return isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={testConnection}
        disabled={isLoading}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors"
        style={{ 
          backgroundColor: isConnected ? '#d0dfc8' : '#fee2e2',
          color: getStatusColor()
        }}
      >
        {getStatusIcon()}
        <span className="font-medium">
          {isLoading ? 'Testing...' : isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </button>
      
      {message && (
        <div className="text-xs text-gray-600 max-w-xs truncate" title={message}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;