import express from 'express';
import { updateDonorProfile } from '../controllers/donorProfileController';


const router = express.Router();


router.put('/:userId/profile/donor', updateDonorProfile); 

export default router;

