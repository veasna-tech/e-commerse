import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import { db, auth } from '../../services/firebase';
import { ref, update, get } from 'firebase/database';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaKey } from 'react-icons/fa';

function Profile() {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setProfileData(prevData => ({
            ...prevData,
            ...userData
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update Firebase Auth Profile
      await updateProfile(auth.currentUser, {
        displayName: `${profileData.firstName} ${profileData.lastName}`
      });

      // Update email if changed
      if (profileData.email !== user.email) {
        await updateEmail(auth.currentUser, profileData.email);
      }

      // Update Database Profile
      const updates = {
        [`users/${user.uid}`]: {
          ...profileData,
          updatedAt: new Date().toISOString()
        }
      };

      await update(ref(db), updates);

      // Update Redux State
      dispatch(setUser({
        ...user,
        ...profileData
      }));

      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(auth.currentUser, passwordData.newPassword);
      toast.success('Password updated successfully');
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Profile Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">My Profile</h2>
                <div>
                  <button
                    className="btn btn-outline-primary me-2"
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    disabled={loading}
                  >
                    <FaKey className="me-2" />
                    Change Password
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setEditing(!editing)}
                    disabled={loading}
                  >
                    {editing ? (
                      <>
                        <FaSave className="me-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <FaEdit className="me-2" />
                        Edit Profile
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Personal Information */}
                  <div className="col-12">
                    <h5 className="mb-3">
                      <FaUser className="me-2" />
                      Personal Information
                    </h5>
                    <div className="bg-body-tertiary p-3 rounded">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">First Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleInputChange}
                            disabled={!editing}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Last Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleInputChange}
                            disabled={!editing}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="col-12">
                    <h5 className="mb-3">
                      <FaEnvelope className="me-2" />
                      Contact Information
                    </h5>
                    <div className="bg-body-tertiary p-3 rounded">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={profileData.email}
                            disabled
                          />
                          <small className="text-muted">Email cannot be changed</small>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Phone</label>
                          <input
                            type="tel"
                            className="form-control"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            disabled={!editing}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="col-12">
                    <h5 className="mb-3">
                      <FaMapMarkerAlt className="me-2" />
                      Address Information
                    </h5>
                    <div className="bg-body-tertiary p-3 rounded">
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label">Address</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address"
                            value={profileData.address}
                            onChange={handleInputChange}
                            disabled={!editing}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">City</label>
                          <input
                            type="text"
                            className="form-control"
                            name="city"
                            value={profileData.city}
                            onChange={handleInputChange}
                            disabled={!editing}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Postal Code</label>
                          <input
                            type="text"
                            className="form-control"
                            name="postalCode"
                            value={profileData.postalCode}
                            onChange={handleInputChange}
                            disabled={!editing}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {editing && (
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        'Update Profile'
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Password Change Card */}
          {showPasswordChange && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h3 className="mb-4">Change Password</h3>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-2"
                      onClick={() => setShowPasswordChange(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile; 