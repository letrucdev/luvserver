-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th3 04, 2023 lúc 07:03 PM
-- Phiên bản máy phục vụ: 10.4.24-MariaDB
-- Phiên bản PHP: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `luvmessenger`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user`
--

CREATE TABLE `user` (
  `id` bigint(20) NOT NULL,
  `username` longtext NOT NULL,
  `email` longtext NOT NULL,
  `account` varchar(1024) NOT NULL,
  `password` varchar(1024) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `account_type` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `user`
--

INSERT INTO `user` (`id`, `username`, `email`, `account`, `password`, `created_at`, `account_type`) VALUES
(1, 'Trực Lê', 'lechinhtruc321@gmail.com', 'letruc', '8J17QKn4wkWbQOB9MIxErk8cm2s=', '2023-03-01 09:53:46.771094', 1),
(2, 'Trực 1', 'letruc@gmail.com', 'letruc@gmail.com', '8J17QKn4wkWbQOB9MIxErk8cm2s=', '2023-03-04 06:38:01.343513', 1),
(5, 'Trực', 'letruc321@gmail.com', 'letruc321@gmail.com', '8J17QKn4wkWbQOB9MIxErk8cm2s=', '2023-03-02 05:30:48.847078', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_chat`
--

CREATE TABLE `user_chat` (
  `id` bigint(20) NOT NULL,
  `sent_id` bigint(20) NOT NULL,
  `recived_id` bigint(20) NOT NULL,
  `content` longtext NOT NULL,
  `at` timestamp NOT NULL DEFAULT current_timestamp(),
  `isRead` int(1) NOT NULL DEFAULT 0,
  `remove` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `user_chat`
--

INSERT INTO `user_chat` (`id`, `sent_id`, `recived_id`, `content`, `at`, `isRead`, `remove`) VALUES
(249, 2, 1, 'hello', '2023-03-04 13:00:45', 0, 0),
(250, 1, 2, 'hi!', '2023-03-04 13:01:00', 0, 0),
(251, 1, 2, 'dd', '2023-03-04 13:28:48', 0, 0),
(252, 1, 2, '123123', '2023-03-04 13:31:27', 0, 0),
(253, 1, 2, 'qweqeqwe', '2023-03-04 13:32:18', 0, 0),
(254, 1, 2, 'ghehehehe', '2023-03-04 13:32:20', 0, 0),
(255, 1, 2, 'zzz', '2023-03-04 13:32:23', 0, 0),
(256, 1, 2, 'cc', '2023-03-04 13:32:25', 0, 0),
(257, 1, 2, 'lag vl', '2023-03-04 13:32:28', 0, 0),
(258, 1, 2, 'asdasdasd', '2023-03-04 13:32:29', 0, 0),
(259, 1, 2, 'asd', '2023-03-04 13:32:31', 0, 0),
(260, 1, 2, '', '2023-03-04 13:32:31', 0, 0),
(261, 1, 2, '', '2023-03-04 13:32:32', 0, 0),
(262, 1, 2, 'sdas', '2023-03-04 13:32:33', 0, 0),
(263, 1, 2, 'asdasdasda', '2023-03-04 13:32:35', 0, 0),
(264, 2, 1, 'sdasdasd', '2023-03-04 13:34:44', 0, 0),
(265, 2, 1, 'hello', '2023-03-04 13:36:02', 0, 0),
(266, 2, 1, 'lag vl', '2023-03-04 13:36:12', 0, 0),
(267, 1, 2, '12312', '2023-03-04 13:37:12', 0, 0),
(268, 1, 2, 'kakakakakaka', '2023-03-04 13:37:22', 0, 0),
(269, 1, 2, 'test', '2023-03-04 13:37:26', 0, 0),
(270, 2, 1, 'ok', '2023-03-04 13:37:39', 0, 0),
(271, 2, 1, 'được đấy', '2023-03-04 13:37:44', 0, 0),
(272, 2, 1, 'qweqweq', '2023-03-04 13:40:48', 0, 0),
(273, 2, 1, 'hgahahaahahaha', '2023-03-04 13:42:36', 0, 0),
(274, 1, 2, 'sdfsdfsdfs', '2023-03-04 13:42:42', 0, 0),
(275, 1, 2, 'đmmmm', '2023-03-04 13:42:45', 0, 0),
(276, 1, 2, 'áđâsd', '2023-03-04 13:42:47', 0, 0),
(277, 1, 2, 'áđasad', '2023-03-04 13:42:49', 0, 0),
(278, 1, 2, 'áđá', '2023-03-04 13:42:51', 0, 0),
(279, 2, 1, 'deo gi', '2023-03-04 13:43:02', 0, 0),
(280, 1, 2, '😍😍', '2023-03-04 13:43:35', 0, 0),
(281, 2, 5, 'haha', '2023-03-04 13:44:07', 0, 0),
(282, 2, 5, 'bbb', '2023-03-04 13:47:52', 0, 0),
(283, 1, 2, 'ee', '2023-03-04 13:49:23', 0, 0),
(284, 2, 5, 'tets', '2023-03-04 13:49:30', 0, 0),
(285, 2, 1, 'hehe', '2023-03-04 13:49:38', 0, 0),
(286, 2, 1, 'đc phết ấy nhể =))', '2023-03-04 13:49:54', 0, 0),
(287, 1, 2, 'áđasadsad', '2023-03-04 13:49:58', 0, 0),
(288, 2, 5, 'sđâsđá', '2023-03-04 13:50:03', 0, 0),
(289, 1, 2, 'dsdsđá', '2023-03-04 13:50:11', 0, 0),
(290, 2, 5, 'ádsdsdsđá', '2023-03-04 13:50:17', 0, 0),
(291, 1, 2, 'áđasad', '2023-03-04 13:50:20', 0, 0),
(292, 2, 5, 'áđâsd', '2023-03-04 13:50:22', 0, 0),
(293, 1, 2, 'áđâsd', '2023-03-04 13:50:25', 0, 0),
(294, 2, 5, 'ádấd', '2023-03-04 13:50:27', 0, 0),
(295, 1, 2, 'áđasad', '2023-03-04 13:50:30', 0, 0),
(296, 2, 1, 'áđâsd', '2023-03-04 14:25:03', 0, 0),
(297, 2, 1, 'áđâsd', '2023-03-04 14:25:06', 0, 0),
(298, 1, 2, 'áđâsd', '2023-03-04 14:25:32', 0, 0),
(299, 2, 5, 'áđâsd', '2023-03-04 14:25:42', 0, 0),
(300, 1, 2, 'áđâsd', '2023-03-04 14:25:46', 0, 0),
(301, 1, 2, 'áđâsd', '2023-03-04 14:27:02', 0, 0),
(302, 1, 2, 'ee', '2023-03-04 14:27:05', 0, 0),
(303, 1, 2, 'dd', '2023-03-04 14:28:29', 0, 0),
(304, 1, 2, 'ê', '2023-03-04 14:28:45', 0, 0),
(305, 2, 1, '?', '2023-03-04 14:28:51', 0, 0),
(306, 2, 5, 'áđâsđá', '2023-03-04 14:29:05', 0, 0),
(307, 1, 2, 'lul', '2023-03-04 14:29:10', 0, 0),
(308, 1, 2, 'qưeqưeqưe', '2023-03-04 14:29:19', 0, 0),
(309, 1, 2, 'hehehehehehehehehe', '2023-03-04 14:29:25', 0, 0),
(310, 2, 1, 'đâsd', '2023-03-04 14:30:53', 0, 0),
(311, 1, 2, 'okok', '2023-03-04 14:31:01', 0, 0),
(312, 1, 2, 'wow', '2023-03-04 14:31:11', 0, 0),
(313, 1, 2, 'how it work', '2023-03-04 14:31:15', 0, 0),
(314, 2, 1, 'i dunno', '2023-03-04 14:31:45', 0, 0),
(315, 1, 2, 'hehe', '2023-03-04 14:31:52', 0, 0),
(316, 2, 1, ':d', '2023-03-04 14:32:03', 0, 0),
(317, 1, 2, 'áđâsd', '2023-03-04 14:32:06', 0, 0),
(318, 2, 5, '123123123', '2023-03-04 14:32:12', 0, 0),
(319, 1, 2, 'qưeqưeqưe', '2023-03-04 14:32:15', 0, 0),
(320, 2, 5, 'bủh', '2023-03-04 14:32:22', 0, 0),
(321, 2, 1, 'áđasadá', '2023-03-04 14:32:27', 0, 0),
(322, 2, 5, 'áđâsda', '2023-03-04 14:32:30', 0, 0),
(323, 2, 5, '1231231', '2023-03-04 14:32:36', 0, 0),
(324, 1, 2, 'áđâsđá', '2023-03-04 14:32:39', 0, 0),
(325, 2, 5, 'hehe', '2023-03-04 14:34:23', 0, 0),
(326, 2, 1, '🖤🖤', '2023-03-04 14:34:47', 0, 0),
(327, 1, 2, 'đàm', '2023-03-04 14:34:53', 0, 0),
(328, 1, 2, '12312312', '2023-03-04 14:35:17', 0, 0),
(329, 1, 2, 'https://www.youtube.com/watch?v=ffTfgfVhl3k', '2023-03-04 14:54:50', 0, 0),
(330, 1, 2, 'https://www.facebook.com', '2023-03-04 14:56:05', 0, 0),
(331, 1, 2, 'https://www.youtube.com/embed/ffTfgfVhl3k', '2023-03-04 16:05:43', 0, 0),
(332, 1, 2, 'https://stackoverflow.com/questions/54676966/push-method-in-react-hooks-usestate', '2023-03-04 16:15:27', 0, 0),
(333, 1, 2, 'asdasdasd', '2023-03-04 16:21:06', 0, 0),
(334, 1, 2, 'https://stackoverflow.com/questions/54676966/push-method-in-react-hooks-usestate', '2023-03-04 16:21:09', 0, 0),
(335, 1, 2, 'sdsd', '2023-03-04 18:01:51', 0, 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_chat_history`
--

CREATE TABLE `user_chat_history` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `user_chat_id` bigint(20) NOT NULL,
  `last_message` longtext NOT NULL,
  `isRead` int(1) NOT NULL DEFAULT 0,
  `at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `user_chat_history`
--

INSERT INTO `user_chat_history` (`id`, `user_id`, `user_chat_id`, `last_message`, `isRead`, `at`) VALUES
(12, 2, 1, '{\"from_user_id\":1,\"content\":\"sdsd\"}', 0, '2023-03-04 18:01:51'),
(13, 1, 2, '{\"from_user_id\":1,\"content\":\"sdsd\"}', 1, '2023-03-04 18:01:51'),
(18, 2, 5, '{\"from_user_id\":2,\"content\":\"hehe\"}', 1, '2023-03-04 14:34:23'),
(19, 5, 2, '{\"from_user_id\":2,\"content\":\"hehe\"}', 0, '2023-03-04 14:34:23');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_friend_list`
--

CREATE TABLE `user_friend_list` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `friend_id` bigint(20) NOT NULL,
  `add_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `user_friend_list`
--

INSERT INTO `user_friend_list` (`id`, `user_id`, `friend_id`, `add_at`) VALUES
(75, 1, 2, '2023-03-04 08:13:01'),
(76, 2, 1, '2023-03-04 08:13:01'),
(77, 5, 2, '2023-03-04 08:20:35'),
(78, 2, 5, '2023-03-04 08:20:35');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_friend_request`
--

CREATE TABLE `user_friend_request` (
  `id` bigint(20) NOT NULL,
  `from_user_id` bigint(20) NOT NULL,
  `to_user_id` bigint(20) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_notification`
--

CREATE TABLE `user_notification` (
  `id` bigint(20) NOT NULL,
  `to_user_id` bigint(20) NOT NULL,
  `from_user_id` bigint(20) DEFAULT NULL,
  `from_user` longtext DEFAULT NULL,
  `content` longtext NOT NULL,
  `image` longtext DEFAULT NULL,
  `type` int(11) NOT NULL DEFAULT 0,
  `isRead` int(11) NOT NULL DEFAULT 0,
  `at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `user_notification`
--

INSERT INTO `user_notification` (`id`, `to_user_id`, `from_user_id`, `from_user`, `content`, `image`, `type`, `isRead`, `at`) VALUES
(115, 2, 1, 'Trực Lê', '', '//1/123132.png', 1, 1, '2023-03-04 08:13:01'),
(116, 2, 5, 'Trực', '', '//5/186553568_154037980068029_8609297119847075105_n.png', 1, 1, '2023-03-04 08:20:35');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_online`
--

CREATE TABLE `user_online` (
  `user_id` bigint(20) NOT NULL,
  `socket_room` varchar(1024) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `user_online`
--

INSERT INTO `user_online` (`user_id`, `socket_room`, `ip_address`, `login_time`) VALUES
(1, '2ksGUdowJ2PC_GyHAAAB', '::1', '2023-03-04 16:16:57');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_setting`
--

CREATE TABLE `user_setting` (
  `user_id` bigint(20) NOT NULL,
  `setting` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `user_setting`
--

INSERT INTO `user_setting` (`user_id`, `setting`) VALUES
(1, 'eyJhdmF0YXIiOiIvLzEvMTIzMTMyLnBuZyIsInN0YXR1cyI6MCwiZnJpZW5kcmVxdWVzdCI6MCwiYXV0b2xvY2siOjAsInRoZW1lIjoiL2JnLmpwZyIsInR5cGluZyI6MSwiaGlkZV9wcmV2X2ltYWdlIjowLCJub3RpZmljYXRpb24iOjEsIm5vdGlmaWNhdGlvbl9zb3VuZHMiOjEsImhpZGVfbm90aWZpY2F0aW9uX2NvbnRlbnQiOjB9'),
(2, 'eyJhdmF0YXIiOiIvLzIvMjczMTA2NzcwXzI5ODM2NjQ5NTg2Mjk5OTZfNDI3NzEwMDY4NTExNjI3Njc4MF9uLmpwZyIsInN0YXR1cyI6MSwiZnJpZW5kcmVxdWVzdCI6MSwiYXV0b2xvY2siOjAsInRoZW1lIjoiL2JnMi5qcGciLCJ0eXBpbmciOjEsImhpZGVfcHJldl9pbWFnZSI6MCwibm90aWZpY2F0aW9uIjoxLCJub3RpZmljYXRpb25fc291bmRzIjoxLCJoaWRlX25vdGlmaWNhdGlvbl9jb250ZW50IjowfQ=='),
(5, 'eyJhdmF0YXIiOiIvLzUvMTg2NTUzNTY4XzE1NDAzNzk4MDA2ODAyOV84NjA5Mjk3MTE5ODQ3MDc1MTA1X24ucG5nIiwic3RhdHVzIjowLCJmcmllbmRyZXF1ZXN0IjowLCJhdXRvbG9jayI6MCwidGhlbWUiOiIvYmcyLmpwZyIsInR5cGluZyI6MSwiaGlkZV9wcmV2X2ltYWdlIjowLCJub3RpZmljYXRpb24iOjEsIm5vdGlmaWNhdGlvbl9zb3VuZHMiOjEsImhpZGVfbm90aWZpY2F0aW9uX2NvbnRlbnQiOjB9');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `user_chat`
--
ALTER TABLE `user_chat`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `user_chat_history`
--
ALTER TABLE `user_chat_history`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `user_friend_list`
--
ALTER TABLE `user_friend_list`
  ADD PRIMARY KEY (`id`),
  ADD KEY `friend_id` (`friend_id`),
  ADD KEY `user_id` (`user_id`) USING BTREE;

--
-- Chỉ mục cho bảng `user_friend_request`
--
ALTER TABLE `user_friend_request`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `user_notification`
--
ALTER TABLE `user_notification`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `user_online`
--
ALTER TABLE `user_online`
  ADD PRIMARY KEY (`user_id`);

--
-- Chỉ mục cho bảng `user_setting`
--
ALTER TABLE `user_setting`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `user`
--
ALTER TABLE `user`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `user_chat`
--
ALTER TABLE `user_chat`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=336;

--
-- AUTO_INCREMENT cho bảng `user_chat_history`
--
ALTER TABLE `user_chat_history`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT cho bảng `user_friend_list`
--
ALTER TABLE `user_friend_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT cho bảng `user_friend_request`
--
ALTER TABLE `user_friend_request`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT cho bảng `user_notification`
--
ALTER TABLE `user_notification`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `user_friend_list`
--
ALTER TABLE `user_friend_list`
  ADD CONSTRAINT `user_friend_list_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_friend_list_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `user_online`
--
ALTER TABLE `user_online`
  ADD CONSTRAINT `user_online_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `user_setting`
--
ALTER TABLE `user_setting`
  ADD CONSTRAINT `user_setting_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
