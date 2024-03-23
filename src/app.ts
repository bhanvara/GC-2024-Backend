import "./config/authConfig";
import express from "express";
import cors from "cors";
import voteRoute from "./router/voteRoute";
import adminRouter from "./router/adminRoute";
import userRoutes from "./router/userRoutes";
import assetsRoutes from "./router/assetsRoutes";
import pointRoutes from "./router/pointsRoutes";
import announcementRoutes from "./router/announcementRoutes";
import eventRoutes from "./router/eventRoute";
import authRoute from "./router/authRoutes";
import session from 'express-session'; 
import passport from 'passport';
import { attachAccessToken } from "./middleware/authMiddleware";

// import { authorizeToken } from "./middleware/authorizeToken";

const app = express();
app.use(express.json());
app.use(cors());

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
}));

app.use(passport.initialize());
app.use(passport.session());

// use Routers
app.get("/", (req, res) => {
  res.send("Hello World");
});
// app.use(authorizeToken);
app.use("/api/vote", voteRoute);
app.use("/api/event", eventRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRoutes);
// api/user/addUser
// api/user/removeUser
// api/user/getDetails
// api/user/getFollowing
// api/user/follow
// api/user/unfollow

app.use("/api/assets", assetsRoutes);
// api/assets/addCarouselImage
// api/assets/deleteCarouselImage
// api/assets/getCarouselImages

app.use("/api/points",attachAccessToken ,pointRoutes);
// api/points/getPointsTableByEvent
// api/points/getPointsTableByTeam
// api/points/getTotalPointsByTeam

app.use("/api/announcements", attachAccessToken ,announcementRoutes);

app.use("/auth", authRoute);

export default app;
