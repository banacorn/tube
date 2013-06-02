{-# LANGUAGE OverloadedStrings #-}

module Tube where   

import Database.Redis
import Control.Monad.Trans (liftIO)
import Control.Monad
import Control.Monad.ST
import System.Random --(getStdRandom, randomR, randomRs)  
import Data.Monoid
import qualified Data.ByteString as B

--import Data.Array.IO
import Data.Array.ST


import Simulation


--
--  some redis shit
--

connectAndRun f = connect defaultConnectInfo >>= flip runRedis f

getTubesSettings :: RedisCtx m f => m (f [(B.ByteString, B.ByteString)])
getTubesSettings = hgetall "tubes:settings"

test f = connectAndRun $ f >>= liftIO . print

ack :: Redis ()
ack = pubSub (subscribe ["tube"]) $ \msg -> do
      putStrLn $ "Message from " ++ show (msgMessage msg)
      return mempty
--
--
--







--instance FromJSON Block where



--instance FromJSON Map where
--    parseJSON (Object v) =  Map <$> 
--                            v .: "mapIn" <*>
--                            v .: "mapOut"
--    parseJSON _          = mzero




--data Map = Map [Block] [Block] deriving (Show)

--type ID = Int
--data Event  = Create ID
--            | Update ID
--            | Destroy ID
--            deriving (Show, Eq)

--parseEvent :: String -> Event
--parseEvent msg
--    | prefix == "create:" = Create . read $ drop 7 msg
--    | prefix == "update:" = Update . read $ drop 7 msg 
--    | prefix == "destroy" = Destroy . read $ drop 8 msg
--    where   prefix = take 7 msg



--tower = do
--    pubSub (subscribe ["tube"]) controller
--    where   controller msg = do
--                print (parseEvent . toString $ msgMessage msg)
--                return mempty

--test n = do
--    hget key field
--    where   key = "tube:simulation:" ++ read n
--            field = "mapIn"












--
--  
--


--heatup :: [Block] -> [Flow]
--heatup blocks = 
--type Array s = ST s (STArray s Int Population)

--buildPair = do
--    arr <- newArray (1, 1600) (In 0) :: ST s (STArray s Int Population)
--    a <- readArray arr 1
--    writeArray arr 1 (In 50)
--    b <- readArray arr 1
--    return (a, b)

--main = print $ runST buildPair