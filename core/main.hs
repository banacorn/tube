
{-# LANGUAGE OverloadedStrings #-}


import Database.Redis
import Control.Monad.Trans (liftIO)
import Control.Monad
import System.Random --(getStdRandom, randomR, randomRs)  
import Data.Monoid
import Data.ByteString (ByteString)

connectAndRun f = connect defaultConnectInfo >>= flip runRedis f

--main = connectAndRun $ do
--    pubSub (subscribe ["node"]) $ \msg -> do
--        putStrLn $ "Message from " ++ show (msgMessage msg)
--        return mempty

getTubesSettings :: RedisCtx m f => m (f [(ByteString, ByteString)])
getTubesSettings = hgetall "tubes:settings"

test f = connectAndRun $ f >>= liftIO . print

ack :: Redis ()
ack = pubSub (subscribe ["tubes"]) $ \msg -> do
      putStrLn $ "Message from " ++ show (msgMessage msg)
      return mempty
