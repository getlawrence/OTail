package opamp

import (
	"context"
	"net"
	"time"

	"github.com/open-telemetry/opamp-go/protobufs"
)

// mockConnection implements types.Connection interface
type mockConnection struct {
	id string
}

// mockNetConn implements net.Conn interface
type mockNetConn struct {
	net.Conn
}

func (m *mockNetConn) Read(b []byte) (n int, err error)   { return 0, nil }
func (m *mockNetConn) Write(b []byte) (n int, err error)  { return len(b), nil }
func (m *mockNetConn) Close() error                       { return nil }
func (m *mockNetConn) LocalAddr() net.Addr                { return &net.TCPAddr{} }
func (m *mockNetConn) RemoteAddr() net.Addr               { return &net.TCPAddr{} }
func (m *mockNetConn) SetDeadline(t time.Time) error      { return nil }
func (m *mockNetConn) SetReadDeadline(t time.Time) error  { return nil }
func (m *mockNetConn) SetWriteDeadline(t time.Time) error { return nil }

func (m *mockConnection) Connection() net.Conn                                         { return &mockNetConn{} }
func (m *mockConnection) Close() error                                                 { return nil }
func (m *mockConnection) Disconnect() error                                            { return m.Close() }
func (m *mockConnection) Send(ctx context.Context, msg *protobufs.ServerToAgent) error { return nil }
func (m *mockConnection) GetRemoteAddr() string                                        { return m.id }
