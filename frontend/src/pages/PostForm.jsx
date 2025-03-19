import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import api from '../services/api';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faFloppyDisk, faImages, faXmark, faSmile } from '@fortawesome/free-solid-svg-icons';
import { PuffLoader } from 'react-spinners';

const PostForm = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    published: false,
  });
  const [postImages, setPostImages] = useState([]);
  const [publishError, setPublishError] = useState(null);
  const [loading, setLoading] = useState(false);


  const userId = localStorage.getItem('userId');
  const isEditing = !!postId;

  useEffect(() => {
    setLoading(true);
    async function initializePost() {
      if (isEditing) {
        try {
          const response = await api.get(`/posts/${postId}`);
          const postData = {
            title: response.data.post.title,
            text: response.data.post.text,
            published: response.data.post.published,
          };
          setFormData(postData);
          setPostImages(response.data.post.images.map((image) => ({
            ...image,
            url: image.url,
            isUploaded: true,
          })));
        } catch (error) {
          console.error('Error initializing post:', error);
        }
      }
    }

    initializePost();
    setLoading(false);
  }, [userId, postId, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setFormData({
        title: '',
        text: '',
        published: false,
      });
      setPostImages([]);
    }
  }, [isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const id = uuidv4();
    const reader = new FileReader();

    reader.onloadend = () => {
      setPostImages([
        ...postImages,
        {
          id,
          url: reader.result,
          file,
        },
      ]);
    };

    reader.readAsDataURL(file);
  };

  const handleGifSelect = (gif) => {
    const gifData = {
      id: uuidv4(),
      url: gif.images.original.url,
      isGif: true,
    };
    setPostImages([...postImages, gifData]);
    setGifModalOpen(false);
  };

  const handleImageDelete = async (image) => {
    try {
      setPostImages(postImages.filter((i) => i.id !== image.id));
      if (image.isUploaded) {
        let deleteIds = image.id;
        let deletePublicIds = null;

        if (image.publicId) {
          deletePublicIds = image.publicId;
        }
        // If has publicId (user uploaded not gif then delete public Ids too)
        const queryString = new URLSearchParams({
          deleteIds: deleteIds,
          deletePublicIds: deletePublicIds,
        }).toString();

        await api.delete(`/images?${queryString}`);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      setPostImages([...postImages, image]);
    }
  };

  const handleSubmit = async (e, published) => {
    e.preventDefault();

    if (published && !formData.title) {
      setPublishError('Title is required to publish the post.');
      return;
    }

    setLoading(true); // Set loading state to true
    try {
      // Upload new files if any
      await Promise.all(
        postImages
          .filter((image) => image.file)
          .map(async (image) => {
            const uploadData = new FormData();
            uploadData.append('image', image.file);
            uploadData.append('id', image.id);

            await api.post(`/images`, uploadData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          })
      );

      const formDataToSend = {
        ...formData,
        published,
        imageIds: postImages.map((image) => image.id),
      };

      if (isEditing) {
        await api.put(`/posts/${postId}`, formDataToSend);
      } else {
        await api.post(`/posts/`, formDataToSend);
      }

      navigate(`/profile/${userId}`);
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="bg-zinc-800 min-h-screen p-6">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <PuffLoader color="#424347" size={60} />
        </div>
      ) : (
      <div className="max-w-4xl mx-auto bg-zinc-700 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">{isEditing ? (formData.published ? 'Edit Post' : 'Edit Draft') : 'Create Post'}</h2>
        <form onSubmit={(e) => handleSubmit(e, false)}> 
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">
              <span className='text-red-600 text-lg mr-1'>*</span>
              Title:
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:outline-none focus:ring-zinc-300 focus:border-zinc-300 sm:text-sm"
            />
          </div>
          <div>
            {postImages.length > 0 &&
                <div className="block text-sm font-medium text-gray-300">
                  Images:
                </div>}
            <div className="mt-2 flex flex-wrap">
              {postImages.length > 0 && 
                postImages.map((image) => (
                  <div key={image.id} className="relative w-24 h-24 mr-4 mb-4">
                    <img
                      src={image.url}
                      alt={`Uploaded ${image.id}`}
                      className="object-cover w-full h-full rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageDelete(image)}
                      className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center bg-zinc-800 opacity-80 text-white rounded-full p-1 text-sm focus:outline-none"
                    >
                      x
                    </button>
                  </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-medium text-gray-300">
              Content:
            </label>
            <textarea
              id="text"
              name="text"
              value={formData.text || ''}
              onChange={handleInputChange}
              rows="5"
              required
              className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:outline-none focus:ring-zinc-300 focus:border-zinc-300 sm:text-sm"
            />
            <div className='flex items-center space-x-4 text-sm'>
              {/* Image Upload Button */}
              <div className='my-4'>
                <label
                  htmlFor="images"
                  className="flex items-center space-x-2 px-3 py-2 h-full text-xs sm:text-sm text-gray-100 bg-zinc-600 border border-gray-600 rounded-md shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 cursor-pointer"
                > 
                  <FontAwesomeIcon icon={faImages} className="mr-1" />
                  <span>Upload images</span>
                </label>
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className='border-t border-gray-700 my-6'></div>

          <div className="flex space-x-4 text-xs sm:text-sm">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              className="w-1/3 py-2 px-4 bg-zinc-600 text-gray-200 font-semibold rounded-md shadow flex items-center justify-center space-x-2 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <FontAwesomeIcon icon={faFloppyDisk} />
              <span>Save as Draft</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="w-1/3 py-2 px-4 bg-teal-600 text-gray-200 font-semibold rounded-md shadow flex items-center justify-center space-x-2 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              {isEditing ? (formData.published 
                ? 
                  <>
                    <FontAwesomeIcon icon={faCloudArrowUp} />
                    <span>Save Changes</span>
                  </>
                : 
                  <>
                    <FontAwesomeIcon icon={faCloudArrowUp} />
                    <span>Publish Draft</span>
                  </>
                ) 
                : 
                  <>
                    <FontAwesomeIcon icon={faCloudArrowUp} />
                    <span>Publish</span>
                  </>
                }
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-1/3 py-2 px-4 bg-zinc-600 text-gray-200 font-semibold rounded-md shadow flex items-center justify-center space-x-2 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <FontAwesomeIcon icon={faXmark} />
              <span>Cancel</span>
            </button>
          </div>
          {publishError && <p className="text-red-500 text-sm mt-2">{publishError}</p>}
        </form>
      </div>
    )}
    </div>
  );
};

export default PostForm;
