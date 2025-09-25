import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (authContext?.userInfo) {
      navigate('/');
    }
  }, [navigate, authContext?.userInfo]);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post('http://localhost:3001/api/users/login', { email, password }, config);
      authContext?.login(data);
      navigate('/');
    } catch (error: any) {
      setMessage(error.response?.data?.message || error.message);
    }
  };

  return (
    <div>
      <h1>ログイン</h1>
      {message && <div className="alert alert-danger">{message}</div>}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="email">
          <Form.Label>メールアドレス</Form.Label>
          <Form.Control
            type="email"
            placeholder="メールアドレスを入力"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label>パスワード</Form.Label>
          <Form.Control
            type="password"
            placeholder="パスワードを入力"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button type="submit" variant="primary" className="my-3">
          ログイン
        </Button>
      </Form>

      <Row className="py-3">
        <Col>
          新しい方はこちら <Link to="/register">新規登録</Link>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;