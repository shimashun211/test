import { useContext, useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

interface Notification {
  _id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string; // Date string
}

const Header = () => {
  const authContext = useContext(AuthContext);
  const { userInfo, logout } = authContext!;
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userInfo) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          };
          const { data } = await axios.get('http://localhost:3001/api/users/notifications', config);
          setNotifications(data);
          setUnreadCount(data.filter((n: Notification) => !n.read).length);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };
    fetchNotifications();
    // Poll for new notifications every 30 seconds (for demo purposes)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userInfo]);

  const logoutHandler = () => {
    logout();
    navigate('/');
  };

  const markAllAsReadHandler = async () => {
    if (userInfo) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.post('http://localhost:3001/api/users/notifications/read', {}, config);
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>教科書マッチング</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <LinkContainer to="/">
              <Nav.Link>ホーム</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/products/add">
              <Nav.Link>譲渡登録</Nav.Link>
            </LinkContainer>

            {userInfo && (
              <LinkContainer to="/matched-products">
                <Nav.Link>チャット</Nav.Link>
              </LinkContainer>
            )}

            {userInfo && (
              <NavDropdown title={<>通知 {unreadCount > 0 && <Badge pill bg="danger">{unreadCount}</Badge>}</>} id="notifications-nav-dropdown">
                {notifications.length === 0 ? (
                  <NavDropdown.Item disabled>通知はありません</NavDropdown.Item>
                ) : (
                  notifications.map(notification => (
                    <NavDropdown.Item key={notification._id} disabled={notification.read} style={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                      {notification.message}
                    </NavDropdown.Item>
                  ))
                )}
                {notifications.length > 0 && unreadCount > 0 && (
                  <NavDropdown.Divider />
                )}
                {notifications.length > 0 && unreadCount > 0 && (
                  <NavDropdown.Item onClick={markAllAsReadHandler}>すべて既読にする</NavDropdown.Item>
                )}
              </NavDropdown>
            )}

            {userInfo ? (
              <NavDropdown title={userInfo.name} id="username">
                <LinkContainer to="/profile">
                  <NavDropdown.Item>プロフィール</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Item onClick={logoutHandler}>
                  ログアウト
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <LinkContainer to="/login">
                <Nav.Link>
                  <i className="fas fa-user"></i> ログイン
                </Nav.Link>
              </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
