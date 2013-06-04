module Tube.Block (

    -- Types
    Probability,
    Population,
    Flow,
    Block(..),
    RawBlock(..),
    FlowBlock(..),

    -- Functions
    toFlowBlock,
    manhattanDistance,
    (<<->>)

) where

type Probability = Double
type Coordinate = (Int, Int)
type Population = Int
type Flow = [Population]
data RawBlock = RawBlock Coordinate (Population, Population) deriving (Show, Eq)
data FlowBlock = FlowBlock Coordinate (Population, Population) Flow deriving (Show, Eq)


toFlowBlock :: [RawBlock] -> RawBlock -> FlowBlock
toFlowBlock blocks block = FlowBlock coord (pin, pout) (fromOnetoAll blocks block) 
    where   RawBlock coord (pin, pout) = block


--  linear time dispatching (deterministic, not ideal)
dispatch :: [Probability] -> Int -> [Int]
dispatch probs quantity = sprinkle baseShare (quantity - baseSum)
    where   
            baseShare = map (\p -> floor $ fromIntegral quantity * p) probs
            baseSum = sum baseShare
            sprinkle xs 0 = xs
            sprinkle (x:xs) n = (succ x):sprinkle xs (pred n)

beta = a * (exp (-s * v))
    where   a = 0.000315
            s = log (blockSize * blockSize)
            v = 0.177

blockSize = 250 :: Double

a = RawBlock (0, 0) (100, 100)
b = RawBlock (30, 40) (400, 400)
c = RawBlock (10, 10) (500, 500)
blocks = [a, b, c]


manhattanDistance :: Coordinate -> Coordinate -> Int
manhattanDistance (x, y) (x', y') = abs (x - x') + abs (y - y')

(<<->>) = manhattanDistance

infix 8 <<->>
infix 8 <->
class Block a where
    from :: a -> Int
    to :: a -> Int
    coordinate :: a -> Coordinate
    -- distance <->
    (<->) :: a -> a -> Double
    a <-> b = factor . sqrt . fromIntegral $ x * x + y * y
        where   (ax, ay) = coordinate a
                (bx, by) = coordinate b
                x = abs (ax - bx)
                y = abs (ay - by)
                factor = (* blockSize)

instance Block RawBlock where
    from (RawBlock _ (_, p)) = p
    to (RawBlock _ (p, _)) = p
    coordinate (RawBlock c _) = c

instance Block FlowBlock where
    from (FlowBlock _ (_, p) _) = p
    to (FlowBlock _ (p, _) _) = p
    coordinate (FlowBlock c _ _) = c




--fromOnetoOne :: RawBlock -> RawBlock -> Probability
--fromOnetoOne a b = (fromIntegral $ to b) * exp (-beta * a <-> b)
fromOnetoOne a b = fromIntegral $ to b

fromOnetoAll blocks block = dispatch (normalize total) (from block)
    where   total = map (fromOnetoOne block) blocks
            normalize list = map (flip (/) (sum list)) list

fromAlltoAll blocks = map (fromOnetoAll blocks) blocks