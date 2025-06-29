"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Laugh, ThumbsUp, Angry, Frown, Smile } from "lucide-react";
import { useState, useCallback, useRef } from "react";

const reactions = [
	{ icon: Heart, emoji: "❤️", color: "text-red-500", name: "love" },
	{ icon: Laugh, emoji: "😂", color: "text-yellow-500", name: "laugh" },
	{ icon: ThumbsUp, emoji: "👍", color: "text-blue-500", name: "like" },
	{ icon: Smile, emoji: "😊", color: "text-green-500", name: "smile" },
	{ icon: Frown, emoji: "😢", color: "text-blue-400", name: "sad" },
	{ icon: Angry, emoji: "😠", color: "text-red-600", name: "angry" },
];

export function ReactionsPanel({ show, onReactionSelect }) {
	const [isThrottled, setIsThrottled] = useState(false);
	const throttleTimeoutRef = useRef(null);
	const lastReactionTimeRef = useRef(0);

	// Throttled reaction handler to prevent spam
	const handleReactionClick = useCallback(
		(reaction) => {
			const now = Date.now();
			const timeSinceLastReaction = now - lastReactionTimeRef.current;

			// Throttle reactions to max 1 per 500ms
			if (timeSinceLastReaction < 500) {
				if (!isThrottled) {
					setIsThrottled(true);
					// Clear any existing timeout
					if (throttleTimeoutRef.current) {
						clearTimeout(throttleTimeoutRef.current);
					}
					// Set new timeout
					throttleTimeoutRef.current = setTimeout(() => {
						setIsThrottled(false);
					}, 500 - timeSinceLastReaction);
				}
				return;
			}

			lastReactionTimeRef.current = now;
			onReactionSelect(reaction);

			// Brief visual feedback
			setIsThrottled(true);
			if (throttleTimeoutRef.current) {
				clearTimeout(throttleTimeoutRef.current);
			}
			throttleTimeoutRef.current = setTimeout(() => {
				setIsThrottled(false);
			}, 200);
		},
		[onReactionSelect, isThrottled]
	);

	return (
		<AnimatePresence>
			{show && (
				<motion.div
					initial={{ opacity: 0, y: 30, scale: 0.85 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 30, scale: 0.85 }}
					transition={{ duration: 0.18, ease: "easeOut" }}
					className="absolute bottom-16 left-10/12 transform -translate-x-1/2 bg-black/90 backdrop-blur-md rounded-xl p-2 flex items-center space-x-1 border border-gray-700/50 shadow-xl min-w-fit z-30"
				>
					{reactions.map((reaction, index) => (
						<motion.button
							key={reaction.name}
							onClick={() => handleReactionClick(reaction)}
							disabled={isThrottled}
							whileHover={{ scale: 1.13 }}
							whileTap={{ scale: 0.93 }}
							initial={{ opacity: 0, scale: 0 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: index * 0.04, duration: 0.16 }}
							className={`w-10 h-10 rounded-full bg-gray-800/80 hover:bg-gray-700/80 text-2xl p-0 border-2 border-transparent hover:border-orange-400/50 transition-all duration-200 backdrop-blur-md flex items-center justify-center select-none ${
								{
									true: "opacity-50 cursor-not-allowed",
									false: "hover:shadow-md hover:shadow-orange-400/25",
								}[isThrottled.toString()]
							}`}
						>
							{reaction.emoji}
						</motion.button>
					))}
				</motion.div>
			)}
		</AnimatePresence>
	);
}