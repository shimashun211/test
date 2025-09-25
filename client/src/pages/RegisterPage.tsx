import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (password !== confirmPassword) {
      setMessage('パスワードが一致しません');
    } else {
      setMessage(null);
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
          },
        };
        const { data } = await axios.post('http://localhost:3001/api/users', { name, email, password }, config);
        authContext?.login(data);
        navigate('/');
      } catch (error: any) {
        setMessage(error.response?.data?.message || error.message);
      }
    }
  };

  return (
    <div>
      <h1>新規登録</h1>
      {message && <div className="alert alert-danger">{message}</div>}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="name">
          <Form.Label>名前</Form.Label>
          <Form.Control
            type="text"
            placeholder="名前を入力"
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></Form.Control>
        </Form.Group>

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

        <Form.Group controlId="confirmPassword">
          <Form.Label>パスワード（確認用）</Form.Label>
          <Form.Control
            type="password"
            placeholder="パスワードを再入力"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button type="submit" variant="primary" className="my-3">
          登録
        </Button>
      </Form>

      <Row className="py-3">
        <Col>
          アカウントをお持ちの方はこちら <Link to="/login">ログイン</Link>
        </Col>
      </Row>
    </div>
  );
};

export default RegisterPage;