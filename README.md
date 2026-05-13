# ⚱ KOSARAJU CAVES

**Kosaraju Caves** là một minigame thám hiểm mê cung dựa trên lý thuyết đồ thị và hệ thống **Ngũ Hành** (Kim, Mộc, Thủy, Hỏa, Thổ). Người chơi sẽ bước vào những hang động cổ xưa, đối mặt với bẫy rập và tìm kiếm cổ vật thất truyền.

![Preview](bg_fire.png) *(Hình ảnh minh họa hệ Hỏa)*

## 🌟 Tính Năng Nổi Bật

### 1. Hệ Thống Ngũ Hành (Wu Xing)
Trò chơi bao gồm 5 loại bản đồ với đặc trưng thị giác và hiệu ứng môi trường riêng biệt:
- **⚙ Kim (Metal):** Thiết Mạch Cổ Thành - Kiến trúc kim khí, bánh răng cổ.
- **❄ Thủy (Water):** Băng Tuyết U Cốc - Tuyết rơi u huyền, lạnh lẽo.
- **🌿 Mộc (Wood):** Lâm Động Rễ Sâu - Rừng rậm sinh trưởng, lá bay huyền ảo.
- **🔥 Hỏa (Fire):** Hỏa Long Hắc Động - Nham thạch nóng chảy, không khí hừng hực.
- **⛰ Thổ (Earth):** Huyền Thổ Mộ Đạo - Đất đá nứt vỡ, năng lượng địa chấn.

### 2. Hiệu Ứng Hình Ảnh Cao Cấp
- **Ambience Layers:** Hệ thống nền động đa tầng (Snow fall, Earth fracture, Forest bloom).
- **Thematic Trap Effects:** Hiệu ứng toàn màn hình khi dính bẫy:
    - **Hỏa:** Bốc cháy rực rỡ.
    - **Thủy:** Đóng băng mặt kính.
    - **Thổ:** Vỡ màn hình kịch tính.
    - **Mộc:** Rèm cửa cây cối vây hãm.
    - **Kim:** Những đường chém sắc lẹm.

### 3. Cơ Chế Thám Hiểm
- **Đồ thị hướng:** Di chuyển theo các chỉ dẫn mũi tên.
- **Ancient Vision:** Thu thập Crystal để soi các đường rút lui ẩn bằng phím **V**.
- **Hệ thống Túi đồ:** Quản lý Shield (bảo vệ), Key (mở khóa) và Relic (cổ vật).

## 🎮 Cách Chơi

1. **Chọn Bản Đồ:** Lựa chọn khí mạch bạn muốn thám hiểm.
2. **Di Chuyển:** Click vào các node để di chuyển. Bạn chỉ có thể đi xuôi theo chiều mũi tên trừ khi có Ancient Vision.
3. **Mục Tiêu:**
    - Tìm **Master Key** ẩn giấu trong hang.
    - Đến node chứa **Ancient Relic** để lấy cổ vật.
    - Quay trở lại **Entrance** (Node 0) để chiến thắng.
4. **Sinh Tồn:** Cẩn thận với các bẫy (Traps). Sử dụng Shield hoặc Potion để duy trì HP.

## 🛠 Công Nghệ Sử Dụng

- **Engine:** Phaser.js 3.60
- **Styling:** CSS3 (Advanced Gradients, Keyframe Animations, Backdrop Filters)
- **Logic:** Vanilla JavaScript (Graph-based Map Generation)

## 📂 Cấu Trúc Mã Nguồn

- `index.html`: Cấu trúc UI và lớp phủ hiệu ứng.
- `style.css`: Hệ thống thiết kế, chủ đề ngũ hành và animations.
- `game.js`: Logic xử lý Phaser, điều khiển nhân vật và sự kiện node.
- `ui.js`: Quản lý trạng thái, âm thanh hệ thống và hiệu ứng bẫy DOM.
- `mapGenerator.js`: Thuật toán khởi tạo mê cung và đồ thị.

---
*Phát triển bởi ddp3206-source. Chúc bạn có những giây phút thám hiểm thú vị!*
