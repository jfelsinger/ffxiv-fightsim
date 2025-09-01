export function useDataChannels() {

    function getLocalConnection() {
        const localConnection = (window as any).localConnection = (window as any).localConnection || new RTCPeerConnection();
        return localConnection;
    }

    function getRemoteConnection() {
        const remoteConnection = (window as any).remoteConnection = (window as any).remoteConnection || new RTCPeerConnection();
        return remoteConnection;
    }

    return {};
}
