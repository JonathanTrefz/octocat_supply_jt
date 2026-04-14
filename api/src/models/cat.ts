/**
 * @swagger
 * components:
 *   schemas:
 *     Cat:
 *       type: object
 *       required:
 *         - catId
 *         - name
 *         - breed
 *         - personality
 *         - zoomiesPerHour
 *         - napsPerDay
 *         - judginessLevel
 *       properties:
 *         catId:
 *           type: integer
 *           description: The unique identifier for the cat
 *         name:
 *           type: string
 *           description: The cat's distinguished name
 *         breed:
 *           type: string
 *           description: The cat's breed
 *         personality:
 *           type: string
 *           description: D&D-style personality alignment (e.g. "Chaotic Treat-Seeker")
 *         bio:
 *           type: string
 *           description: A short, highly accurate biographical statement
 *         zoomiesPerHour:
 *           type: number
 *           format: float
 *           description: Average number of unprompted zoomie episodes per hour
 *         napsPerDay:
 *           type: integer
 *           description: Average number of naps per day
 *         judginessLevel:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Subjective judginess score from 1 (chill) to 10 (withering)
 *         favoriteProductId:
 *           type: integer
 *           nullable: true
 *           description: ID of the cat's favorite OctoCAT Supply product
 *         imgName:
 *           type: string
 *           nullable: true
 *           description: Filename of the cat's profile image
 */
export interface Cat {
  catId: number;
  name: string;
  breed: string;
  personality: string;
  bio?: string;
  zoomiesPerHour: number;
  napsPerDay: number;
  judginessLevel: number;
  favoriteProductId?: number | null;
  imgName?: string | null;
}
