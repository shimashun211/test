import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const faculties = ['RU', 'RB', 'RD', 'RE', 'RM', 'RG'];

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { userInfo } = authContext!;

  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [faculty, setFaculty] = useState(faculties[0]); // Default to first faculty

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };

      const { data } = await axios.post('http://localhost:3001/api/upload', formData, config);
      setImage(data.image);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };
      await axios.post('http://localhost:3001/api/products', { name, image, description, faculty }, config);
      navigate('/');
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <div>
      <h1>教科書を譲渡登録する</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="name">
          <Form.Label>タイトル</Form.Label>
          <Form.Control
            type="text"
            placeholder="教科書のタイトルを入力"
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="faculty">
          <Form.Label>学系</Form.Label>
          <Form.Control
            as="select"
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
          >
            {faculties.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="image">
          <Form.Label>画像</Form.Label>
          <Form.Control
            type="text"
            placeholder="画像のURL"
            value={image}
            readOnly
          ></Form.Control>
          <Form.Control type="file" onChange={uploadFileHandler} />
        </Form.Group>

        <Form.Group controlId="description">
          <Form.Label>説明</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="教科書の状態などを入力"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button type="submit" variant="primary" className="my-3">
          登録する
        </Button>
      </Form>
    </div>
  );
};

export default ProductCreatePage;