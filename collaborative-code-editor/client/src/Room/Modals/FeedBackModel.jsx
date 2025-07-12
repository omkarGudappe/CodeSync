import React, { useState, useEffect } from 'react';
import '../Styles/FeedBackModel.css';

const FeedBackModel = ({ CloseFeedBackModel , UserName }) => {
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [error , setError] = useState('');
  const [success , setSuccess] = useState(false);

  useEffect(() => {
    validateForm();
  }, [feedbackType, feedbackMessage, selectedRating, selectedEmoji]);

  const validateForm = () => {
    const valid = feedbackType && 
                  feedbackMessage.trim().length >= 20 && 
                  selectedRating > 0 && 
                  selectedEmoji !== '';
    setIsValid(valid);
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setFeedbackMessage(value);
    setCharCount(value.length);
  };

  const handleStarHover = (rating) => {
    setHoveredRating(rating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
  };

  const handleEmojiClick = (emoji) => {
    setSelectedEmoji(emoji);
  };

  const handleSubmit = async() => {
    if (!isValid) return;
    
    setIsSubmitting(true);

    try{
        const res = await fetch("http://localhost:4000/api/feedback" , {
            method:"POST",
            headers : {"Content-Type" :"application/json"},
            body: JSON.stringify({message:feedbackMessage , name:UserName , tooltip: selectedEmoji})
        })
         
        if(!res.ok){
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to send feedback. Please try again");
        }
        setShowThankYou(true);
        setSuccess(true);
        console.log("Sended success");
    }catch(err){
       setError(err.message);
    }finally{
        setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFeedbackType('');
    setFeedbackMessage('');
    setCharCount(0);
    setSelectedRating(0);
    setHoveredRating(0);
    setSelectedEmoji('');
    setIsSubmitting(false);
    setShowThankYou(false);
    CloseFeedBackModel();
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((rating) => {
      const isActive = rating <= selectedRating;
      const isHovered = rating <= hoveredRating && hoveredRating > 0;
      
      return (
        <div 
          key={rating}
          className={`star ${isActive ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
          data-rating={rating}
          onMouseEnter={() => handleStarHover(rating)}
          onMouseLeave={handleStarLeave}
          onClick={() => handleStarClick(rating)}
        >
          <i className="bi bi-star-fill"></i>
          <span className="star-tooltip">
            {rating === 1 ? 'Poor' : 
             rating === 2 ? 'Fair' : 
             rating === 3 ? 'Good' : 
             rating === 4 ? 'Very Good' : 'Excellent'}
          </span>
        </div>
      );
    });
  };

  const emojiOptions = [
    { emoji: '😍', tooltip: 'Love-it!' },
    { emoji: '😊', tooltip: 'Happy' },
    { emoji: '😐', tooltip: 'Neutral' },
    { emoji: '😕', tooltip: 'Confused' },
    { emoji: '😠', tooltip: 'Frustrated' }
  ];

  return (
    <div className="feedback-modal-container">
      <div className="feedback-modal-overlay" onClick={resetForm}></div>
      <div className="feedback-modal show">
        <div className="feedback-header">
          <h5 className="feedback-title">
            <i className="bi bi-chat-square"></i>
            Share Your Thoughts
          </h5>
          <button 
            type="button" 
            className="close-btn-model" 
            onClick={resetForm}
            aria-label="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className="feedback-body">
          {!showThankYou && (
            <div id="feedbackForm">
              <div className="mb-4">
                <label htmlFor="feedbackType" className="form-label">
                  <i className="bi bi-tag"></i>
                  Feedback Type
                </label>
                <select 
                  className="form-select" 
                  id="feedbackType"
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                >
                  <option value="" disabled>Select feedback type...</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature"> Feature Request</option>
                  <option value="suggestion"> General Suggestion</option>
                  <option value="experience"> User Experience</option>
                  <option value="other"> Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="feedbackMessage" className="form-label">
                  <i className="bi bi-pencil-square"></i>
                  Your Feedback
                </label>
                <textarea 
                  className="form-control" 
                  id="feedbackMessage" 
                  rows="2"
                  placeholder="Tell us what you think... Be as detailed as you can."
                  maxLength="500"
                  value={feedbackMessage}
                  onChange={handleMessageChange}
                ></textarea>
                <div className={`character-count ${charCount > 490 ? 'error' : charCount > 400 ? 'warning' : ''}`}>
                  {charCount}/500 characters
                </div>
              </div>
              
              <div className="emoji-section">
                <span className="emoji-label">
                  <i className="bi bi-emoji-smile"></i>
                  How do you feel about this?
                </span>
                <div className="emoji-picker">
                  {emojiOptions.map((option) => (
                    <button
                      key={option.emoji}
                      type="button"
                      className={`emoji-option ${selectedEmoji === option.tooltip ? 'selected' : ''}`}
                      data-emoji={option.emoji}
                      onClick={() => handleEmojiClick(option.tooltip)}
                    >
                      {option.emoji}
                      <span className="emoji-tooltip text-light">{option.tooltip}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="rating-container">
                <span className="rating-label">
                  <i className="bi bi-star"></i>
                  How would you rate your experience?
                </span>
                <div className="rating-stars">
                  {renderStars()}
                </div>
              </div>
              
              <div className="feedback-footer">
                <button 
                  type="button" 
                  className={`btn-submit ${isSubmitting ? 'loading' : ''}`}
                  onClick={handleSubmit}
                  disabled={!isValid || isSubmitting}
                >
                  <div className="spinner"></div>
                  <span>Submit Feedback</span>
                </button>
              </div>
               {error && (
                 <div className="auth-message error bg-dark">
                    {error}
                    {setTimeout(() => setError("") , 7000)}
                 </div>
               )}
            </div>
        )}
           {success && <div className="thank-you-message">
              <div className="thank-you-icon">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <h3 className="thank-you-title">Thank You!</h3>
              <p className="thank-you-text">
                Thank you for your feedback. Your feedback is invaluable to us. We'll use it to make our product even better.
              </p>
              <button
                type="button" 
                className="btn btn-done" 
                onClick={() => {resetForm() ; setSuccess(false)}}
              >
                Done
              </button>
            </div>}
          {/* )} */}
        </div>
      </div>
    </div>
  );
};

export default FeedBackModel;