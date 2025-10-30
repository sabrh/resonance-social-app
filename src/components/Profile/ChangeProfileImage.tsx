import { useState, useContext } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth"; // type-only import
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext/AuthContext";

// Type for your MongoDB user document
export interface UserDocument {
  uid: string;
  name?: string;
  email: string;
  photoURL?: string;
  role?: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface ChangeProfileImageProps {
  userDoc: UserDocument | null;
  setUserDoc: React.Dispatch<React.SetStateAction<UserDocument | null>>;
  onProfileImageUpdated?: () => void; // add callback

}

const ChangeProfileImage: React.FC<ChangeProfileImageProps> = ({
  userDoc,
  setUserDoc,
  onProfileImageUpdated, // added new for profile post
}) => {
  const [newPhotoURL, setNewPhotoURL] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { user: firebaseUser } = useContext(AuthContext) as {
    user: FirebaseUser | null;
  };
  const auth = getAuth();

  console.log(userDoc)

  const handleUpdateImage = async (): Promise<void> => {
    const trimmedURL = newPhotoURL.trim();

    if (!firebaseUser || !trimmedURL) {
      toast.error("Please enter a valid image URL");
      return;
    }

    setLoading(true);
    try {
      //  1. Update Firebase Auth profile photo
      await updateProfile(auth.currentUser!, { photoURL: trimmedURL });

      // 2. Update MongoDB (via your backend)
      await axios.put(
        `https://resonance-social-server.vercel.app/users/${firebaseUser.uid}/photo`,
        { photoURL: trimmedURL }
      );

      //  3. Fetch updated user document
      const { data } = await axios.get<UserDocument>(
        `https://resonance-social-server.vercel.app/users/${firebaseUser.uid}`
      );
      setUserDoc(data);

      //  4. Reload Firebase user (for consistency)
      await auth.currentUser?.reload();

       //  Trigger post refresh
      onProfileImageUpdated?.();

      toast.success(" Profile photo updated successfully!");
      setNewPhotoURL("");
    } catch (error) {
      console.error(" Photo update failed:", error);
      toast.error("Failed to update profile image!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-base-content/80 mb-2">
        Change Profile Image (via URL)
      </label>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          placeholder="Paste new image URL"
          value={newPhotoURL}
          onChange={(e) => setNewPhotoURL(e.target.value)}
          className="input input-bordered w-full sm:w-96"
        />
        <button
          onClick={handleUpdateImage}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Updating..." : "Update Image"}
        </button>
      </div>
    </div>
  );
};

export default ChangeProfileImage;
