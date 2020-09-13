<template>
 <div class="app-container">
    <div class="filter-container">
        <!-- 比赛名称 -->
        <el-input v-model="queryParams.title" placeholder="比赛名称" class="filter-item search-item"/>
        <!-- 比赛等级 -->
        <el-select  v-model="queryParams.level"  value="" placeholder="比赛等级" class="filter-item search-item">
          <el-option
            v-for="match in whether"
            :key="match.id"
            :label="match.name"
            :value="match.id"
          />
        </el-select>
        <!-- 负责人 -->
        <el-input v-model="queryParams.chargeFullName" placeholder="负责人" class="filter-item search-item"/>
        <!-- 指导老师 -->
        <el-input v-model="queryParams.teacherFullName" placeholder="指导老师" class="filter-item search-item"/>
        <!-- 比赛时间 -->
        <el-date-picker
        v-model="queryParams.time"
        :range-separator="null"
        start-placeholder="比赛时间"
        value-format="yyyy-MM-dd"
        class="filter-item search-item date-range-item"
        type="daterange"
      />
        <!-- 搜索 -->
        <el-button class="filter-item" type="primary" plain @click="search">
            {{ $t('table.search') }}
        </el-button>
        <!-- 重置 -->
        <el-button class="filter-item" type="warning" plain @click="reset">
            {{ $t('table.reset') }}
        </el-button>
        <!-- 添加 -->
        <el-button class="filter-item" type="success" plain @click.native="add">
            {{ $t('table.add') }}
        </el-button>
        <!-- 更多操作 -->
        <!-- <el-dropdown v-has-any-permission="['task:add','task:delete','task:export']" trigger="click" class="filter-item">
          <el-button>
            {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-has-permission="['task:delete']" @click.native="batchDelete">{{ $t('table.delete') }}</el-dropdown-item>
            <el-dropdown-item v-has-permission="['task:export']" @click.native="exportExcel">{{ $t('table.export') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown> -->
    </div>

    <!-- 表 -->
    <el-table
      ref="table"
      :key="tableKey"
      :data="list"
      border
      fit
      style="width: 100%;"
      @selection-change="onSelectChange"
      @sort-change="sortChange"
      @row-click="toogleExpand"
    >
        <el-table-column type="selection" align="center" width="40px" />
        <!-- 参赛时间 -->
        <el-table-column label="参赛时间" prop="time" :show-overflow-tooltip="true" align="center" min-width="95px">
            <template slot-scope="scope">
              <span>{{ scope.row.time }}</span>
            </template>
        </el-table-column>
        <!-- 比赛名称 -->
        <el-table-column label="比赛名称" prop="title" :show-overflow-tooltip="true" align="center" min-width="115px">
          <template slot-scope="scope">
            <span>{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <!-- 主办单位 -->
        <el-table-column label="主办单位" prop="sponsor" :show-overflow-tooltip="true" align="center" min-width="95px">
            <template slot-scope="scope">
              <span>{{ scope.row.sponsor }}</span>
            </template>
        </el-table-column>
        <!-- 等级 -->
        <el-table-column
            label="等级" 
            :filters="[{text: '国家级', value: 0},{ text: '省级', value: 1 },{ text: '校级', value: 2 }]"
            :filter-method="filterLevel"
            class-name="level-col"
            align="center"
            min-width="80px"
        >
          <template slot-scope="{row}">
            <el-tag :type="row.level | levelFilter">
              <span>{{transLevel(row.level)}}</span> 
            </el-tag>
          </template>
        </el-table-column>
        <!-- 类型 -->
        <el-table-column
            label="类型"
            :filters="[{text: '个人', value: 0},{ text: '团队', value: 1 }]"
            :filter-method="filterType"
            class-name="type-col"
            align="center"
            min-width="75px"
        >
          <template slot-scope="{row}">
            <el-tag :type="row.type | typeFilter">
              {{ row.type === 1 ? '团队' : '个人' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 申请书 -->
        <!-- <el-table-column label="申请书" prop="applicationForm" :show-overflow-tooltip="true" type="primary" align="center" min-width="100px">
            <template slot-scope="scope">
                <el-button v-if="scope.row.applicationForm !== ''" size="mini" type="primary" plain  @click.stop="upload(scope.row.applicationForm)">下载</el-button>
            </template>
        </el-table-column> -->
        <!-- 比赛名次 -->
        <el-table-column 
            label="比赛名次" 
            :filters="[{text: '一等奖', value: 1 },{ text: '二等奖', value: 2 },{ text: '三等奖', value: 3 },{ text: '特等奖', value: 4 },{ text: '优胜奖', value: 5 },{ text: '无', value: 6 }]"
            :filter-method="filterRankCode"
            class-name="rankCode-col"
            align="center"
            min-width="90px"
        >
            <template slot-scope="{row}">
              <el-tag :type="row.rankCode | rankCodeFilter">
                <span>{{transRankCode(row.rankCode)}}</span> 
              </el-tag>
            </template>
        </el-table-column>
        <!-- 负责人 -->
        <el-table-column label="负责人" :show-overflow-tooltip="true" align="center" min-width="70px">
          <template slot-scope="scope">
            <span>{{ scope.row.chargeFullName }}</span>
          </template>
        </el-table-column>
        <!-- 指导老师 -->
        <el-table-column label='指导老师' :show-overflow-tooltip="true" align="center" min-width="90px">
          <template slot-scope="scope">
            <span>{{ scope.row.teacherFullName }}</span>
          </template>
        </el-table-column>
        <!-- 状态 -->
        <el-table-column
            label="状态"
            :filters="[{text: '进行中', value: 1},{ text: '已完成', value: 2 }]"
            :filter-method="filterState"
            class-name="state-col"
            align="center"
            min-width="80px"
        >
          <template slot-scope="{row}">
            <el-tag :type="row.state | stateFilter">
              {{ row.state === 2 ? '已完成' : '进行中' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 报销情况 -->
        <!-- <el-table-column
          label="报销情况"
          :filters="[{text: '未报销', value: 0},{ text: '已报销', value: 1 }]"
          :filter-method="filterReimbursement"
          class-name="reimbursement-col"
          align="center"
           min-width="90px"
        >
          <template slot-scope="{row}">
            <el-tag :type="row.reimbursement | reimbursementFilter">
              {{ row.reimbursement === 1 ? '已报销' : '未报销' }}
            </el-tag>
          </template>
        </el-table-column> -->
        <!-- 操作-->
        <el-table-column :label="$t('table.operation')" align="center" min-width="145px" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-tooltip
              v-hasPermission="['task:add']"
              class="item"
              effect="dark"
              content="申请报销"
              placement="top"
              :enterable="false"
            >
              <i v-hasPermission="['task:add']" class="el-icon-coin table-operation" style="color: #87d068;" @click.stop="changeReimbursement(row)" />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['task:update']"
              class="item"
              effect="dark"
              content="修改比赛"
              placement="top"
              :enterable="false"
            >
              <i v-hasPermission="['task:update']" class="el-icon-setting table-operation" style="color: #2db7f5;" @click.stop="edit(row)" />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['task:delete']"
              class="item"
              effect="dark"
              content="删除比赛"
              placement="top"
              :enterable="false"
            >
              <i v-hasPermission="['task:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click.stop="singleDelete(row)" />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['task:view']"
              class="item"
              effect="dark"
              content="查看详情"
              placement="top"
              :enterable="false"
            >
              <i v-hasPermission="['task:view']" class="el-icon-info table-operation" style="color: #909399;" @row-click="toogleExpand(row)" />
            </el-tooltip>
            <el-link v-has-no-permission="['task:add','task:view','task:update','task:delete']" class="no-perm">
              {{ $t('tips.noPermission') }}
            </el-link>
          </template>
        </el-table-column>
        <!-- 展开区域 -->
        <el-table-column type="expand" width="1px">
          <template slot-scope="props">
            <el-form label-position="left" class="table-expand">
              <el-row>
                <el-col :span="11">
                  <el-form-item label="成员:">
                    <span>{{ team.member }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="花费:">
                    <span>{{props.row.cost}}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item label="申请书:">
                    <el-button v-if="props.row.applicationForm !== ''" type="primary" plain size="mini" @click.stop="upload(props.row.applicationForm)">下载</el-button>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="11">
                  <el-form-item label="发票:">
                    <div class="demo-image" v-if="props.row.invoice">
                      <div class="block" v-for="(item, i) in props.row.invoice.split(',')" :key="i">
                        <el-image
                          :src="item"
                          @click="showpreViewDialog(item)">
                        </el-image>
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="11">
                  <el-form-item label="证书:">
                    <div class="demo-image" v-if="props.row.certificate">
                      <div class="block" v-for="(item, i) in props.row.certificate.split(',')" :key="i">
                        <el-image
                          :src="item"
                          @click="showpreViewDialog(item)">
                        </el-image>
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </template>
        </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pagination.num" :limit.sync="pagination.size" @pagination="search" />
    <match-edit
      ref="edit"
      :dialog-visible="dialog.isVisible"
      :title="dialog.title"
      @success="editSuccess"
      @close="editClose"
    />
    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="40%"
      @close="previewDialogClose"
    >
      <el-image :src="previewPath" alt class="previewImg" />
    </el-dialog>
 </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import MatchEdit from './Edit'
// import MatchView from './View'
export default {
  name: 'MatchManage',
  components: { Pagination, MatchEdit },
  filters: {
    // 比赛等级
    levelFilter(level) {
      const map = {
        0: 'success',
        1: 'warning',
        2: ''
      }
      return map[level]
    },
    // 比赛类型
    typeFilter(type) {
      const map = {
        0: 'warning',
        1: 'success'
      }
      return map[type]
    },
    // 状态
    stateFilter(state) {
      const map = {
        1: 'warning',
        2: 'success'
      }
      return map[state]
    },
    // 比赛名次
    rankCodeFilter(rankCode) {
      const map = {
        1: 'success',
        2: 'warning',
        3: '',
        4: '',
        5: '',
        6: 'info'
      }
      return map[rankCode]
    },
    // 是否已报销
    reimbursementFilter(reimbursement) {
      const map = {
        0: 'warning',
        1: 'success'
      }
      return map[reimbursement]
    }
  },
  data() {
    return {
      dialog: {
        isVisible: false,
        title: ''
      },
      // userViewVisible: false,
      tableKey: 0,
      loading: false,
      list: [],
      total: 0,
      queryParams: {},
      sort: {},
      selection: [],
      newWin: null,
      // 申请报销所需的资金对象
      Funding: {
        name: '',
        applyTime: '',
        proposerId: 0
      },
      // 保存预览图片路径
      previewPath: '',
      // 图片预览窗口的显示与隐藏
      previewVisible: false,
      pagination: {
        size: 10,
        num: 1
      },
      matchId: '',
      title: '',
      team: {
        reliable: '',
        member: '',
        teacher: ''
      },
      whether: [
        {
          id: 0,
          name: '国家级'
        },
        {
          id: 1,
          name: '省级'
        },
        {
          id: 2,
          name: '校级'
        }
      ],
      url: ''
    }
  },
  created() {
    this.fetch()
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    }
  },
  watch: {
    url(newVal, oldVal) {
      if (newVal && this.newWin) {
        this.newWin.sessionStorage.clear()
        this.newWin.location.href = newVal
        this.url = ''
        this.newWin = null
      }
    }
  },
  mounted() {
    this.fetch()
  },
  methods: {
    // 比赛等级
    transLevel(level) {
      switch (level) {
        case 0:
          return '国家级'
        case 1:
          return '省级'
        default:
          return '校级'
      }
    },
    filterLevel(value, row) {
      return row.level === value
    },
    // 比赛名次
    transRankCode(rankCode) {
      switch (rankCode) {
        case 1:
          return '一等奖'
        case 2:
          return '二等奖'
        case 3:
          return '三等奖'
        case 4:
          return '特等奖'
        case 5:
          return '优胜奖'
        default:
          return '无'
      }
    },
    filterRankCode(value, row) {
      return row.rankCode === value
    },
    // 比赛类型
    filterType(value, row) {
      return row.type === value
    },
    // 状态
    filterState(value, row) {
      return row.state === value
    },
    // 是否已报销
    filterReimbursement(value, row) {
      return row.reimbursement === value
    },
    // viewClose() {
    //   this.userViewVisible = false
    // },
    editClose() {
      this.dialog.isVisible = false
    },
    editSuccess() {
      this.search()
    },
    onSelectChange(selection) {
      this.selection = selection
    },
    upload(url) {
      this.newWin = window.open()
      this.url = url
    },
    search() {
      this.fetch({
        ...this.queryParams,
        ...this.sort
      })
    },
    reset() {
      this.queryParams = {}
      this.sort = {}
      this.$refs.table.clearSort()
      this.$refs.table.clearFilter()
      this.search()
    },
    add() {
      this.dialog.title = this.$t('common.add')
      this.dialog.isVisible = true
    },
    // 操作--->删除
    singleDelete(row) {
      this.$refs.table.toggleRowSelection(row, true)
      this.batchDelete()
    },
    // 更多操作--->删除
    batchDelete() {
      if (!this.selection.length) {
        this.$message({
          message: this.$t('tips.noDataSelected'),
          type: 'warning'
        })
        return
      }
      let contain = false
      this.$confirm(this.$t('tips.confirmDelete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const matchId = []
        this.selection.forEach((u) => {
          // 不能删除自己xxx
          if (u.matchId === this.currentUser.matchId) {
            contain = true
            return
          }
          matchId.push(u.matchId)
        })
        if (contain) {
          this.$message({
            message: this.$t('tips.containCurrentUser'),
            type: 'warning'
          })
          this.clearSelections()
        } else {
          this.delete(matchId)
        }
      }).catch(() => {
        this.clearSelections()
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    delete(matchIds) {
      this.loading = true
      this.$delete(`studio/match/${matchIds}`).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    edit(row) {
      // 已完成的任务无法修改
      if (parseInt(row.state) === 2) {
        return this.$message.info('任务已完成无法修改！')
      }
      // 管理员权限  任务负责人权限
      let flag = this.currentUser.roleId.indexOf('1') === -1
      const fg = row.chargeFullName !== this.currentUser.fullName
      if (!flag || !fg) {
        flag = false
      }
      if (flag) {
        return this.$message.info('仅允许管理员或负责人操作！')
      }
      let userId = row.members
      let reliable = ''
      const member = []
      const teacher = []
      userId.forEach((v1, i1) => {
        if (v1.state === 1) {
          reliable = '' + v1.userId
        }
        if (v1.state === 2) {
          member.push('' + v1.userId)
        }
        if (v1.state === 3) {
          teacher.push('' + v1.userId)
        }
      })
      row.reliable = reliable
      row.member = member
      row.teacher = teacher
      this.$refs.edit.setTasks(row)
      this.dialog.title = this.$t('common.edit')
      this.dialog.isVisible = true
    },
    // 弹出申请报销对话框
    async changeReimbursement(row) {
      // 管理员权限  任务负责人权限
      let flag = this.currentUser.roleId.indexOf('1') === -1
      const fg = row.chargeFullName !== this.currentUser.fullName
      if (!flag || !fg) {
        flag = false
      }
      if (flag) {
        return this.$message.info('仅允许管理员或任务负责人操作！')
      }
      // 检查是否已报销
      if (row.reimbursement === 1) {
        return this.$message.info('该比赛任务已经报销！')
      }
      // 符合条件，弹出申请报销对话框
      const confirmResult = await this.$confirm(
        '您的报销条件已符合, 是否确认报销?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了报销')
      }
      this.Funding.applyTime = this.getTime()
      this.Funding.proposerId = this.currentUser.userId
      this.Funding.name = row.title + '比赛任务报销'
      this.Funding.type = '比赛'
      this.Funding.id = row.matchId
      this.Funding.cost = row.cost
      this.Funding.invoice = row.invoice
      console.log(this.Funding)
      this.$router.push({
        name: '经费管理',
        params: {
          Funding: this.Funding
        }
      })
    },
    // 获取时间
    getTime: function() {
      var _this = this
      const yy = new Date().getFullYear()
      const mm =
        new Date().getMonth() + 1 < 10
          ? '0' + (new Date().getMonth() + 1)
          : new Date().getMonth() + 1
      const dd =
        new Date().getDate() < 10
          ? '0' + new Date().getDate()
          : new Date().getDate()
      _this.nowDate = yy + '-' + mm + '-' + dd
      return _this.nowDate
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      if (this.queryParams.timeRange) {
        params.startTime = this.queryParams.timeRange[0]
        params.endTime = this.queryParams.timeRange[1]
      }
      this.loading = true
      this.$get('studio/match', {
        ...params
      }).then((r) => {
        console.log(r)
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.TakeTeams(data.rows)
        this.loading = false
      })
    },
    TakeTeams(list) {
      list.forEach((v, i) => {
        if (v.invoice === null) {
          v.invoice = ''
        }
        v.members.forEach((v1, i1) => {
          if (v1.state === 1) {
            v.chargeFullName = v1.fullName
          }
          if (v1.state === 3) {
            v.teacherFullName = v1.fullName
          }
          if (v1.state === 2) {
            if (v.memberFullName === undefined) {
              v.memberFullName = v1.fullName
            } else {
              v.memberFullName += '，' + v1.fullName
            }
          }
        })
      })
      this.list = list
    },
    // 手风琴效果
    async toogleExpand(row) {
      this.team.member = row.memberFullName
      const $table = this.$refs.table
      this.list.map((item) => {
        if (row.matchId !== item.matchId) {
          $table.toggleRowExpansion(item, false)
        }
      })
      $table.toggleRowExpansion(row)
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file)
      if ('url' in file) {
        this.previewPath = file.url
      } else {
        this.previewPath = file.response.data.url
      }
      this.previewVisible = true
    },
    // 查看发票图片
    showpreViewDialog(item) {
      this.previewPath = item
      this.previewVisible = true
    },
    // 图片预览关闭
    previewDialogClose() {
      this.previewPath = ''
      this.previewVisible = false
    },
    sortChange(val) {
      this.sort.field = val.prop
      this.sort.order = val.order
      this.search()
    }
  }
}
</script>
<style lang="scss" scoped>
.table-expand {
  font-size: 0;
}
.table-expand label {
  width: 90px;
  color: #99a9bf;
}
.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
.invoiceUl {
  list-style: none;
  margin: 0;
}
.invoiceUl .invoiceLi {
  cursor: pointer;
}
.table-expand[data-v-7ec7feb6] {
  display: flex;
}
.demo-image {
  display: flex;
}
.demo-image .el-image {
  width: 100px;
  height: 100px;
  margin: 0px 10px;
  border:  1px solid #000;
}
.previewImg {
  width: 100%;
}
</style>
