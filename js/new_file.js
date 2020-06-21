// 对象收编变量
const bird = {
	skyPosition: 0,
	skyStep: 2,
	birdTop: 220,
	birdStepY: 0,
	count: 0,
	startColor: 'blue',
	startFlag: false,
	minTop: 0,
	maxTop: 570,
	pipeLength: 7,
	pipeArr: [],
	score: 0,
	pipeLastIndex: 6,
	// 初始化函数
	init() {
		this.initData()
		this.animate()
		this.handle()
		if(sessionStorage.getItem('play')) {
			this.start()
		}
	},
	// 初始化数据
	initData() {
		// 注意:
		this.el = document.getElementById('game')
		this.oBird = this.el.getElementsByClassName('bird')[0]
		this.oStart = this.el.getElementsByClassName('start')[0]
		this.oScore = this.el.getElementsByClassName('score')[0]
		this.oMask = this.el.getElementsByClassName('mask')[0]
		this.oEnd = this.el.getElementsByClassName('end')[0]
		this.oFindScore = this.oEnd.getElementsByClassName('final-score')[0]
		this.oRankList = this.oEnd.getElementsByClassName('rank-list')[0]
		this.oRestart = this.oEnd.getElementsByClassName('restart')[0]
		this.scoreArr = this.getScore()
	},
		
	// 动画
	animate() {
		const self = this
		this.time = setInterval(() => {
			self.skyMove()
			
			if(self.startFlag) 
			{
				// 小鸟下坠开始
				this.birdDrop()
				// 障碍物移动
				this.pipeMove()
			}
			if(++self.count % 10 === 0) {
				// 点击开始后
				if(!self.startFlag) {
					self.birdJump()
					self.starBound()
				}
				self.birdFly(self.count)
			}
		}, 30)
	},
	
	// 天空移动
	skyMove() {
		// 注意：
		this.skyPosition -= this.skyStep
		// 默认是report
		this.el.style.backgroundPositionX = this.skyPosition + 'px'
	},
	
	// 小鸟动
	birdJump() {
		this.birdTop = this.birdTop === 220 ? 260 : 220,
		this.oBird.style.top = this.birdTop + 'px'
	},
	
	// 小鸟飞
	birdFly(count) {
		this.oBird.style.backgroundPositionX = count % 3 * -30 + 'px'
	},
	
	// 小鸟运动
	birdDrop() {
		this.birdTop += ++this.birdStepY
		this.oBird.style.top = this.birdTop + 'px'
		// 碰撞检测
		this.judgeKnock()
		// 加分
		this.addScore()
	},
	
	// 碰撞检测
	judgeKnock() {
		this.judgeBoundary()
		this.judgePipe()
	},
	
	// 临界值碰撞检测
	judgeBoundary() {
		if(this.birdTop < this.minTop || this.birdTop > this.maxTop) {
			// 输了
			this.failGame()
		}
	},
	
	// 柱子碰撞检测
	judgePipe() {
		var index = this.score % this.pipeLength
		var pipeX = this.pipeArr[index].up.offsetLeft
		var pipeY = this.pipeArr[index].y
		var birdY = this.birdTop
		
		if((pipeX <= 95 && pipeX >= 13) && (birdY <= pipeY[0] || birdY >= pipeY[1])) {
			this.failGame()
		}
	},
	
	// 文字放大缩小
	starBound() {
		var preColor = this.startColor
		this.startColor = preColor === 'blue' ? 'white' : 'blue'
		this.oStart.classList.remove(`start-${preColor}`)
		this.oStart.classList.add(`start-${this.startColor}`)
	},
	
	// 事件
	handle() {
		this.handleStart()
		this.handleClick()
		this.handleRestart()
	},
	
	// 点击开始
	handleStart() {
		this.oStart.onclick = this.start.bind(this)
	},
	start() {
		const self = this
		self.startFlag = true
		self.oBird.style.left = '80px'
		self.oStart.style.display = 'none'
		self.oBird.style.transition = 'none'
		self.oScore.style.display = 'block'
		self.skyStep = 5
		
		// 创建障碍物
		for(var i = 0; i < self.pipeLength ; i++) {
			self.createPipe((i+1)*300)
		}
	},
	
	// 往上飞
	handleClick() {
		var self = this
		this.el.onclick = (e) => {
			if(!e.target.classList.contains('start')) {
				self.birdStepY = -10
			}
		}
	},
	
	// 创建障碍物
	createPipe(x) {
		const { upHeight, dowHeight } = this.getPipHeight()
		var oUpPipe = createEle('div', ['pipe', 'pipe-up'], {
			height: upHeight + 'px',
			left: x + 'px'
		})
		var oDownPipe = createEle('div', ['pipe', 'pipe-bottom'], {
			height: dowHeight + 'px',
			left: x + 'px'
		})
		this.el.appendChild(oUpPipe)
		this.el.appendChild(oDownPipe)
		this.pipeArr.push({
			up: oUpPipe,
			down: oDownPipe,
			y: [upHeight, upHeight + 150]
		})
	},
	
	// 障碍物移动
	pipeMove() {
		for(var i = 0; i < this.pipeLength ; i++) {
			var oUpPipe = this.pipeArr[i].up
			var oDownPipe = this.pipeArr[i].down
			var x = oUpPipe.offsetLeft - this.skyStep
			if(x < -52) {
				var lastPipeLeft = this.pipeArr[this.pipeLastIndex].up.offsetLeft
				oUpPipe.style.left = lastPipeLeft + 300 + 'px'
				oDownPipe.style.left = lastPipeLeft + 300 + 'px'
				this.pipeLastIndex = ++ this.pipeLastIndex % this.pipeLength
				const { upHeight, dowHeight } = this.getPipHeight()
				oUpPipe.style.height = upHeight + 'px'
				oDownPipe.style.height = dowHeight + 'px'
				continue
			}
			oUpPipe.style.left = x + 'px'
			oDownPipe.style.left = x + 'px'
		}
	},
	
	// 障碍物高度
	getPipHeight() {
		// 上面障碍物的高度
		var upHeight = 50 + Math.floor(Math.random() * 175)
		// 下面障碍物的高度
		var dowHeight = 600 - 150 - upHeight
		return {
			upHeight,
			dowHeight
		}
	},
	// 加分
	addScore() {
		var index = this.score % this.pipeLength
		var pipeX = this.pipeArr[index].up.offsetLeft
		if(pipeX < 13) {
			this.oScore.innerText = ++ this.score
		}
	},
	
	// 获取本地数据
	getScore() {
		var scoreArr = getLocal('score')
		return scoreArr ? scoreArr : []
	},
	
	// 设置排名
	setScore() {
		this.scoreArr.push({
			score: this.score,
			time: this.getDate()
		})
		this.scoreArr.sort((a, b)=>{
			return b.score - a.score
		})
		setLocal('score', this.scoreArr)
	},
	
	// 获取时间
	getDate() {
		var d = new Date()
		var year = d.getFullYear()
		var month = formatNum(d.getMonth() + 1)
		var day = formatNum(d.getDate())
		var hour = formatNum(d.getHours())
		var minute = formatNum(d.getMinutes())
		var second = formatNum(d.getSeconds())
		
		return `${year}.${month}.${day} ${hour}:${minute}:${second}`
	},
	
	// 输了
 	failGame() {
		clearInterval(this.time)
		this.setScore()
		this.oMask.style.display = 'block'
		this.oEnd.style.display = 'block'
		this.oBird.style.display = 'none'
		this.oScore.style.display = 'none'
		this.oFindScore.innerText = this.score
		this.rendRankList()
	},
	
	// 渲染排名
	rendRankList() {
		var template = ''
		for(var i = 0; i < this.scoreArr.length; i++) {
			var degreeClass = ''
			switch(i) {
				case 0:
					degreeClass = 'first'
					break
				case 1:
					degreeClass = 'second'
					break
				case 2:
					degreeClass = 'third'
					break
			}
			template += `
			<li class="rank-item">
				<span class="rank-degree ${degreeClass}">${i + 1}</span>
				<span class="rank-score">${this.scoreArr[i].score}</span>
				<span class="rank-time">${this.scoreArr[i].time}</span>
			</li>
			`
			if(i === 7) break
		}
		this.oRankList.innerHTML = template
	},
	
	// 从新开始
	handleRestart() {
		this.oRestart.onclick = ()=>{
			sessionStorage.setItem('play', true)
			window.location.reload()
		}
	}
}
