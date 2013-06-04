{-# LANGUAGE OverloadedStrings #-}


module Tube.Simulation where

import Data.Aeson
import Data.List (lookup)
import Control.Applicative ((<$>), (<*>))
import Control.Monad (mzero)
import qualified Data.ByteString as B
import Data.ByteString.Lazy.Char8 (pack)
import Data.ByteString.UTF8 (toString)


import Tube.Block

type Speed = Double

data Info = Info {
        _name :: String,
        _population :: Int,
        _id :: Int,
        _blockSize :: Int,
        _commuteSpeed :: Int,
        _subwaySpeed :: Int
    } deriving Show
data Map = Map Info [Population] [Population] deriving (Show)
data Simulation = Simulation Info [FlowBlock]  

data Station = Station Coordinate 
type Line = [Station]
data Genotype = Genotype [Line]
data Solution = Solution Simulation [Genotype]

instance Show Simulation where
    show (Simulation info blocks) = "Simulation " ++ show info ++ " [" ++ show (length blocks) ++ "]"


--commuteTime :: Simulation -> Speed -> Double
commuteTime (Simulation info blocks) = (sum $ map commuteFromBlock blocks) / fromIntegral (_population info)
    where   commuteFromBlock block = sum $ map time taggedFlows
                where   FlowBlock coord (pin, pout) flows = block
                        size = floor . sqrt . fromIntegral . length $ blocks
                        taggedFlows = zip flows [(x,y) | y <- [0 .. size - 1], x <- [0 .. size - 1]]
                        --time (n, c) = fromIntegral (n * (c <<->> coord) * (_blockSize info)) / (fromIntegral (_commuteSpeed info))
                        time (0, c) = 0
                        time (n, c) = fromIntegral (n * (c <<->> coord)) / speed
                        speed = fromIntegral blockSize / fromIntegral commuteSpeed
                        blockSize = _blockSize info
                        commuteSpeed = _commuteSpeed info
parseMap :: [(B.ByteString, B.ByteString)] -> Map
parseMap hash = Map (Info { 
        _name = name, 
        _population = population,
        _id = modelID,
        _blockSize = 250,
        _commuteSpeed = 250,
        _subwaySpeed = 400
    }) mapIn mapOut
    where   
        name = lookupFor ripQuote "" "name"
        population = lookupFor read 0 "population"
        mapIn = lookupFor read [] "mapIn"
        mapOut = lookupFor read [] "mapOut"
        modelID = lookupFor (read . ripQuote) 0 "id"

        lookupFor f empty key = case lookup key hash of
            Nothing -> empty
            Just n  -> f (toString n)

        ripQuote = init . tail

testMap = Map (Info {
    _name = "Test",
    _population = 1000,
    _id = 0,
    _blockSize = 250,
    _commuteSpeed = 250,
    _subwaySpeed = 400
    }) [0, 500, 200, 400] [200, 100, 200, 500]

toSimulation :: Map -> Simulation
toSimulation (Map info mapIn mapOut) = Simulation info blocks'
    where   blocks' = map (toFlowBlock blocks) blocks
            blocks = map toBlock $ zip3 coordinates mapIn mapOut
            coordinates = [(x, y) | y <- [0 .. size - 1], x <- [0 .. size - 1]]
            size = floor . sqrt . fromIntegral . length $ mapIn
            toBlock (coord, pin, pout) = RawBlock coord (pin, pout)

